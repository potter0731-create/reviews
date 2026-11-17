import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Poster } from "@/components/Poster";
import { Stars } from "@/components/Stars";
import { getEntry } from "@/lib/data";
import { KIND_LABEL, VERB } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/r/[id]">): Promise<Metadata> {
  const e = await getEntry((await params).id);
  return e ? { title: e.title, description: e.oneLine } : {};
}

export default async function Detail({ params }: PageProps<"/r/[id]">) {
  const e = await getEntry((await params).id);
  if (!e) notFound();
  return (
    <article className="grid gap-8 md:grid-cols-[260px_1fr]">
      <Poster entry={e} className="mx-auto w-48 md:w-full" />
      <div>
        <p className="text-sm text-muted">{KIND_LABEL[e.kind]}{e.year ? ` · ${e.year}` : ""}</p>
        <h1 className="mt-1 text-2xl font-bold">{e.title}</h1>
        {e.originalTitle ? <p className="text-sm text-muted">{e.originalTitle}</p> : null}
        <p className="mt-1 text-muted">{e.creator}</p>

        <div className="mt-4 flex items-center gap-3">
          {e.status === "done" ? (
            <>
              <Stars value={e.rating} size="text-xl" />
              {e.rating ? <span className="text-sm text-muted">{e.rating}</span> : null}
              {e.date ? <span className="text-sm text-muted">· {e.date} {VERB[e.kind]}</span> : null}
            </>
          ) : (
            <span className="rounded bg-card px-2 py-1 text-sm text-accent">{e.kind === "movie" ? "보고싶은 영화" : "읽고싶은 책"}</span>
          )}
        </div>

        {e.oneLine ? <p className="mt-6 text-xl font-medium leading-snug">“{e.oneLine}”</p> : null}
        {e.review ? <div className="mt-6 whitespace-pre-wrap leading-8 text-foreground/90">{e.review}</div> : null}

        {e.quotes.length ? (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-bold text-muted">인상 깊은 {e.kind === "movie" ? "대사" : "문장"}</h2>
            <div className="space-y-5">
              {e.quotes.map((q, i) => (
                <blockquote key={i} className="border-l-2 border-accent pl-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{q.text}</p>
                  {q.note ? <footer className="mt-1 text-sm text-muted">{q.note}</footer> : null}
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
