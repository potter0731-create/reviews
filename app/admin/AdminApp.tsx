"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SearchHit } from "@/lib/search";
import { KIND_LABEL, type Entry, type Kind, type Quote } from "@/lib/types";

type Draft = Omit<Entry, "id" | "createdAt" | "updatedAt"> & { id?: string };

const blank = (kind: Kind = "movie"): Draft => ({
  kind,
  title: "",
  creator: "",
  poster: null,
  status: "done",
  rating: 4,
  date: new Date().toISOString().slice(0, 10),
  quotes: [],
});

const input = "w-full rounded-md border border-line bg-card px-3 py-2 outline-none focus:border-accent";
const btn = "rounded-md px-3 py-2 text-sm font-medium";

export function AdminApp({ initial }: { initial: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // 검색
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchErr, setSearchErr] = useState("");

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  async function search() {
    if (!draft || !q.trim()) return;
    setSearchErr("");
    setHits([]);
    const res = await fetch(`/api/admin/search?kind=${draft.kind}&q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!res.ok) setSearchErr(json.error ?? "검색 실패");
    else if (json.hits.length === 0) setSearchErr("검색 결과가 없어요. 아래에 직접 입력해도 돼요");
    else setHits(json.hits);
  }

  function pick(h: SearchHit) {
    setHits([]);
    setDraft((d) =>
      d && {
        ...d,
        title: h.title,
        originalTitle: h.originalTitle,
        creator: h.creator,
        year: h.year,
        poster: h.poster,
      },
    );
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(`⚠️ ${json.error}`);
    const saved = json.entry as Entry;
    setEntries((list) => [saved, ...list.filter((e) => e.id !== saved.id)]);
    setDraft(null);
    setMsg("✅ 저장했어요. 사이트에 보이기까지 1~2분 걸릴 수 있어요.");
  }

  async function remove(e: Entry) {
    if (!confirm(`'${e.title}' 기록을 삭제할까요?`)) return;
    const res = await fetch(`/api/admin/entries?id=${e.id}`, { method: "DELETE" });
    if (res.ok) setEntries((l) => l.filter((x) => x.id !== e.id));
    else setMsg(`⚠️ ${(await res.json()).error}`);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const setQuote = (i: number, patch: Partial<Quote>) =>
    set("quotes", draft!.quotes.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  if (draft) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-lg font-bold">{draft.id ? "기록 수정" : "새 기록"}</h1>

        <div className="flex gap-2">
          {(["movie", "book"] as const).map((k) => (
            <button
              key={k}
              onClick={() => { set("kind", k); setHits([]); }}
              className={`${btn} ${draft.kind === k ? "bg-accent text-black" : "bg-card text-muted"}`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
          <span className="mx-2 border-l border-line" />
          {(["done", "want"] as const).map((s) => (
            <button
              key={s}
              onClick={() => set("status", s)}
              className={`${btn} ${draft.status === s ? "bg-accent text-black" : "bg-card text-muted"}`}
            >
              {s === "done" ? (draft.kind === "movie" ? "봤어요" : "읽었어요") : "찜"}
            </button>
          ))}
        </div>

        {!draft.id && (
          <div>
            <div className="flex gap-2">
              <input
                className={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={`${KIND_LABEL[draft.kind]} 제목으로 검색`}
              />
              <button onClick={search} className={`${btn} shrink-0 bg-card`}>검색</button>
            </div>
            {searchErr ? <p className="mt-2 text-sm text-muted">{searchErr}</p> : null}
            {hits.length > 0 && (
              <ul className="mt-2 max-h-80 divide-y divide-line overflow-y-auto rounded-md border border-line">
                {hits.map((h) => (
                  <li key={h.providerId}>
                    <button onClick={() => pick(h)} className="flex w-full items-center gap-3 p-2 text-left hover:bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {h.poster ? <img src={h.poster} alt="" referrerPolicy="no-referrer" className="h-14 w-10 rounded object-cover" /> : <div className="h-14 w-10 rounded bg-card" />}
                      <span className="min-w-0">
                        <span className="block truncate">{h.title}</span>
                        <span className="block truncate text-xs text-muted">{[h.creator, h.year].filter(Boolean).join(" · ")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm">제목<input className={input} value={draft.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="text-sm">{draft.kind === "movie" ? "감독" : "저자"}<input className={input} value={draft.creator} onChange={(e) => set("creator", e.target.value)} /></label>
          <label className="text-sm">{draft.kind === "movie" ? "개봉 연도" : "출간 연도"}<input className={input} inputMode="numeric" value={draft.year ?? ""} onChange={(e) => set("year", Number(e.target.value) || undefined)} /></label>
          <label className="sm:col-span-2 text-sm">{draft.kind === "movie" ? "포스터" : "표지"} 주소 (https://…)<input className={input} value={draft.poster ?? ""} onChange={(e) => set("poster", e.target.value || null)} /></label>
          {draft.status === "done" && (
            <>
              <label className="text-sm">별점
                <select className={input} value={draft.rating ?? ""} onChange={(e) => set("rating", Number(e.target.value) || undefined)}>
                  <option value="">없음</option>
                  {Array.from({ length: 10 }, (_, i) => (10 - i) / 2).map((r) => (
                    <option key={r} value={r}>{"★".repeat(Math.floor(r))}{r % 1 ? "½" : ""} ({r})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">{draft.kind === "movie" ? "본" : "읽은"} 날짜<input type="date" className={input} value={draft.date ?? ""} onChange={(e) => set("date", e.target.value)} /></label>
              <label className="sm:col-span-2 text-sm">한줄평<input className={input} maxLength={200} value={draft.oneLine ?? ""} onChange={(e) => set("oneLine", e.target.value)} /></label>
              <label className="sm:col-span-2 text-sm">리뷰<textarea className={`${input} min-h-48`} value={draft.review ?? ""} onChange={(e) => set("review", e.target.value)} /></label>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">인상 깊은 {draft.kind === "movie" ? "대사" : "문장"}</span>
            <button onClick={() => set("quotes", [...draft.quotes, { text: "" }])} className={`${btn} bg-card`}>+ 추가</button>
          </div>
          {draft.quotes.map((qt, i) => (
            <div key={i} className="space-y-2 rounded-md border border-line p-3">
              <textarea className={input} rows={2} value={qt.text} onChange={(e) => setQuote(i, { text: e.target.value })} />
              <div className="flex gap-2">
                <input className={input} placeholder="메모·쪽수 (선택)" value={qt.note ?? ""} onChange={(e) => setQuote(i, { note: e.target.value })} />
                <button onClick={() => set("quotes", draft.quotes.filter((_, j) => j !== i))} className={`${btn} shrink-0 bg-card text-muted`}>삭제</button>
              </div>
            </div>
          ))}
        </div>

        {msg ? <p className="text-sm">{msg}</p> : null}
        <div className="flex gap-2">
          <button onClick={save} disabled={busy} className={`${btn} flex-1 bg-accent text-black disabled:opacity-50`}>{busy ? "저장 중…" : "저장"}</button>
          <button onClick={() => { setDraft(null); setMsg(""); }} className={`${btn} bg-card`}>취소</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">관리자</h1>
        <div className="flex gap-2">
          <button onClick={() => { setDraft(blank()); setQ(""); setHits([]); setMsg(""); }} className={`${btn} bg-accent text-black`}>+ 새 기록</button>
          <button onClick={logout} className={`${btn} bg-card text-muted`}>로그아웃</button>
        </div>
      </div>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <ul className="divide-y divide-line rounded-md border border-line">
        {entries.length === 0 && <li className="p-6 text-center text-muted">아직 기록이 없어요.</li>}
        {entries.map((e) => (
          <li key={e.id} className="flex items-center gap-3 p-3">
            <span className="w-8 shrink-0 text-xs text-muted">{KIND_LABEL[e.kind]}</span>
            <Link href={`/r/${e.id}`} className="min-w-0 flex-1 truncate hover:text-accent">{e.title}</Link>
            <button onClick={() => { setDraft({ ...e }); setMsg(""); }} className="text-sm text-muted hover:text-foreground">수정</button>
            <button onClick={() => remove(e)} className="text-sm text-muted hover:text-red-400">삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
