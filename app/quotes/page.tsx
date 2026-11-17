import type { Metadata } from "next";
import Link from "next/link";
import { Empty } from "@/components/PosterCard";
import { getEntries } from "@/lib/data";

export const metadata: Metadata = { title: "인상 깊은 문장" };

export default async function Quotes() {
  const items = (await getEntries()).flatMap((e) => e.quotes.map((q) => ({ q, e })));
  if (items.length === 0) return <Empty>모아둔 문장이 없어요.</Empty>;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-xl font-bold">인상 깊은 대사·문장</h1>
      {items.map(({ q, e }, i) => (
        <figure key={i} className="border-l-2 border-accent pl-4">
          <blockquote className="whitespace-pre-wrap text-lg leading-relaxed">{q.text}</blockquote>
          {q.note ? <p className="mt-1 text-sm text-muted">{q.note}</p> : null}
          <figcaption className="mt-2 text-sm text-muted">
            — <Link href={`/r/${e.id}`} className="hover:text-accent">{e.title}</Link> · {e.creator}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
