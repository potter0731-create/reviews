import Link from "next/link";
import { Empty, Grid, PosterCard } from "@/components/PosterCard";
import { getEntries, parseKind } from "@/lib/data";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const kind = parseKind(typeof sp.kind === "string" ? sp.kind : undefined);
  const all = (await getEntries()).filter((e) => e.status === "done");
  const list = kind ? all.filter((e) => e.kind === kind) : all;

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-xl font-bold">{kind === "movie" ? "본 영화" : kind === "book" ? "읽은 책" : "최근 기록"}</h1>
        <span className="text-sm text-muted">{list.length}개</span>
      </div>
      {list.length === 0 ? (
        <Empty>
          아직 기록이 없어요. <Link href="/admin" className="text-accent underline">관리자 페이지</Link>에서 첫 리뷰를 써보세요.
        </Empty>
      ) : (
        <Grid>
          {list.map((e) => (
            <PosterCard key={e.id} entry={e} />
          ))}
        </Grid>
      )}
    </>
  );
}
