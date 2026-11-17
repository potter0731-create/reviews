import Link from "next/link";
import type { Entry } from "@/lib/types";
import { Poster } from "./Poster";
import { Stars } from "./Stars";

export function PosterCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/r/${entry.id}`} className="group block">
      <div className="transition group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-accent rounded-md">
        <Poster entry={entry} />
      </div>
      <div className="mt-2 px-0.5">
        <div className="truncate text-sm font-medium">{entry.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          {entry.status === "done" ? <Stars value={entry.rating} size="text-xs" /> : <span>{entry.kind === "movie" ? "보고싶어요" : "읽고싶어요"}</span>}
          {entry.year ? <span>{entry.year}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-24 text-center text-muted">{children}</p>;
}
