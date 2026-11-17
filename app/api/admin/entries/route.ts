import { isAdmin } from "@/lib/auth";
import { mutateEntries } from "@/lib/store";
import type { Entry } from "@/lib/types";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** 화면에서 온 값을 믿지 않고 한 번 걸러서 저장 모양으로 만든다 */
function clean(input: Partial<Entry>, prev?: Entry): Entry | string {
  const kind = input.kind === "movie" || input.kind === "book" ? input.kind : null;
  const title = str(input.title, 200);
  if (!kind) return "종류(영화/책)를 골라주세요";
  if (!title) return "제목을 입력해주세요";
  const status = input.status === "want" ? "want" : "done";
  const rating =
    status === "done" && typeof input.rating === "number" && input.rating >= 0.5 && input.rating <= 5
      ? Math.round(input.rating * 2) / 2
      : undefined;
  const date = str(input.date, 10);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "날짜 형식이 올바르지 않아요";
  const poster = str(input.poster, 500);
  if (poster && !/^https:\/\//.test(poster)) return "포스터 주소는 https:// 로 시작해야 해요";
  const year = Number(input.year);
  const now = new Date().toISOString();
  return {
    id: prev?.id ?? randomUUID().slice(0, 8),
    kind,
    title,
    originalTitle: str(input.originalTitle, 200) || undefined,
    creator: str(input.creator, 200),
    year: Number.isInteger(year) && year > 0 ? year : undefined,
    poster: poster || null,
    status,
    rating,
    oneLine: str(input.oneLine, 200) || undefined,
    review: str(input.review, 20000) || undefined,
    date: date || undefined,
    quotes: (Array.isArray(input.quotes) ? input.quotes : [])
      .map((q) => ({ text: str(q?.text, 2000), note: str(q?.note, 200) || undefined }))
      .filter((q) => q.text)
      .slice(0, 50),
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Partial<Entry> | null;
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  let saved: Entry | undefined;
  let problem: string | undefined;
  try {
    await mutateEntries((list) => {
      const prev = body.id ? list.find((e) => e.id === body.id) : undefined;
      const result = clean(body, prev);
      if (typeof result === "string") {
        problem = result;
        return list;
      }
      saved = result;
      return prev ? list.map((e) => (e.id === prev.id ? result : e)) : [...list, result];
    }, `리뷰 저장: ${str(body.title, 60)}`);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  return NextResponse.json({ entry: saved });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  try {
    await mutateEntries((list) => list.filter((e) => e.id !== id), `리뷰 삭제: ${id}`);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
