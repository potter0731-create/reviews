import { readFile, writeFile } from "node:fs/promises";
import { DATA_FILE, sortEntries } from "./data";
import type { Entry } from "./types";

const PATH_IN_REPO = "data/reviews.json";

function ghConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

async function gh(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return res;
}

/**
 * 최신 목록을 읽어 fn 으로 바꾼 뒤 저장한다.
 * GITHUB_TOKEN 이 있으면 GitHub 커밋(→ 사이트 재배포), 없으면 개발용으로 로컬 파일에 쓴다.
 */
export async function mutateEntries(
  fn: (list: Entry[]) => Entry[],
  message: string,
): Promise<void> {
  const cfg = ghConfig();
  if (!cfg) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("GITHUB_TOKEN / GITHUB_REPO 가 설정되지 않아 저장할 수 없어요");
    }
    let current: Entry[] = [];
    try {
      current = JSON.parse(await readFile(DATA_FILE, "utf8"));
    } catch {}
    await writeFile(DATA_FILE, JSON.stringify(sortEntries(fn(current)), null, 2) + "\n");
    return;
  }

  const api = `https://api.github.com/repos/${cfg.repo}/contents/${PATH_IN_REPO}`;
  // 동시 저장으로 sha 가 어긋나면 처음부터 다시 시도
  for (let attempt = 0; attempt < 3; attempt++) {
    const getRes = await gh(`${api}?ref=${encodeURIComponent(cfg.branch)}`, cfg.token);
    let sha: string | undefined;
    let current: Entry[] = [];
    if (getRes.ok) {
      const body = (await getRes.json()) as { sha: string; content: string };
      sha = body.sha;
      current = JSON.parse(Buffer.from(body.content, "base64").toString("utf8"));
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub 읽기 실패 (${getRes.status})`);
    }
    const next = sortEntries(fn(current));
    const putRes = await gh(api, cfg.token, {
      method: "PUT",
      body: JSON.stringify({
        message,
        branch: cfg.branch,
        sha,
        content: Buffer.from(JSON.stringify(next, null, 2) + "\n").toString("base64"),
      }),
    });
    if (putRes.ok) return;
    if (putRes.status !== 409 && putRes.status !== 422) {
      throw new Error(`GitHub 저장 실패 (${putRes.status})`);
    }
  }
  throw new Error("GitHub 저장이 계속 충돌했어요. 잠시 후 다시 시도해주세요");
}
