import type { Entry } from "@/lib/types";

/** 포스터/표지. 이미지가 없으면 제목을 넣은 대체 그래픽 */
export function Poster({ entry, className = "" }: { entry: Pick<Entry, "poster" | "title" | "kind">; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-md bg-card ${className}`}>
      {entry.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.poster}
          alt={`${entry.title} ${entry.kind === "movie" ? "포스터" : "표지"}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2f38] to-[#14171c] p-3 text-center text-sm text-muted">
          {entry.title}
        </div>
      )}
    </div>
  );
}
