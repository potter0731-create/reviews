import type { Metadata } from "next";
import Link from "next/link";
import { Empty } from "@/components/PosterCard";
import { Stars } from "@/components/Stars";
import { getEntries } from "@/lib/data";
import type { Entry } from "@/lib/types";

export const metadata: Metadata = { title: "통계" };

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 shrink-0 text-right text-muted">{label}</span>
      <div className="h-3 flex-1 rounded bg-card">
        <div className="h-3 rounded bg-accent" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="w-6 text-muted">{value}</span>
    </div>
  );
}

function topCreators(list: Entry[]) {
  const m = new Map<string, number>();
  for (const e of list) for (const c of e.creator.split(",").map((s) => s.trim()).filter(Boolean)) m.set(c, (m.get(c) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export default async function Stats({ searchParams }: PageProps<"/stats">) {
  const sp = await searchParams;
  const done = (await getEntries()).filter((e) => e.status === "done" && e.date);
  const years = [...new Set(done.map((e) => e.date!.slice(0, 4)))].sort().reverse();
  if (years.length === 0) return <Empty>날짜가 있는 기록이 생기면 통계가 나타나요.</Empty>;
  const year = typeof sp.year === "string" && years.includes(sp.year) ? sp.year : years[0];
  const list = done.filter((e) => e.date!.startsWith(year));
  const movies = list.filter((e) => e.kind === "movie");
  const books = list.filter((e) => e.kind === "book");
  const rated = list.filter((e) => e.rating);
  const avg = rated.length ? rated.reduce((s, e) => s + e.rating!, 0) / rated.length : 0;

  const months = Array.from({ length: 12 }, (_, i) => list.filter((e) => Number(e.date!.slice(5, 7)) === i + 1).length);
  const dist = Array.from({ length: 10 }, (_, i) => (i + 1) / 2).map((r) => ({ r, n: rated.filter((e) => e.rating === r).length }));
  const best = [...rated].sort((a, b) => b.rating! - a.rating!).slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">{year}년 결산</h1>
        <div className="flex gap-2 text-sm">
          {years.map((y) => (
            <Link key={y} href={`/stats?year=${y}`} className={y === year ? "text-accent" : "text-muted hover:text-foreground"}>
              {y}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["본 영화", `${movies.length}편`],
          ["읽은 책", `${books.length}권`],
          ["평균 별점", avg ? avg.toFixed(2) : "-"],
          ["기록한 문장", `${list.reduce((s, e) => s + e.quotes.length, 0)}개`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-card p-4">
            <div className="text-xs text-muted">{k}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-muted">월별</h2>
        <div className="space-y-1">
          {months.map((n, i) => (
            <Bar key={i} label={`${i + 1}월`} value={n} max={Math.max(...months)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-muted">별점 분포</h2>
        <div className="space-y-1">
          {dist.map(({ r, n }) => (
            <Bar key={r} label={`${r}`} value={n} max={Math.max(...dist.map((d) => d.n))} />
          ))}
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold text-muted">올해의 최고작</h2>
          <ol className="space-y-2">
            {best.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3">
                <Link href={`/r/${e.id}`} className="truncate hover:text-accent">{e.title}</Link>
                <Stars value={e.rating} size="text-sm" />
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-bold text-muted">자주 만난 감독·저자</h2>
          <ol className="space-y-2">
            {topCreators(list).map(([name, n]) => (
              <li key={name} className="flex justify-between"><span>{name}</span><span className="text-muted">{n}</span></li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
