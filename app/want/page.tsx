import type { Metadata } from "next";
import { Empty, Grid, PosterCard } from "@/components/PosterCard";
import { getEntries } from "@/lib/data";

export const metadata: Metadata = { title: "찜한 작품" };

export default async function Want() {
  const list = (await getEntries()).filter((e) => e.status === "want");
  const movies = list.filter((e) => e.kind === "movie");
  const books = list.filter((e) => e.kind === "book");
  if (list.length === 0) return <Empty>찜해둔 작품이 없어요.</Empty>;
  return (
    <div className="space-y-10">
      {[
        ["보고싶은 영화", movies],
        ["읽고싶은 책", books],
      ].map(([title, items]) =>
        (items as typeof list).length ? (
          <section key={title as string}>
            <h2 className="mb-4 text-lg font-bold">{title as string}</h2>
            <Grid>
              {(items as typeof list).map((e) => (
                <PosterCard key={e.id} entry={e} />
              ))}
            </Grid>
          </section>
        ) : null,
      )}
    </div>
  );
}
