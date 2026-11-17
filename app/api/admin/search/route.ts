import { isAdmin } from "@/lib/auth";
import { parseKind } from "@/lib/data";
import { searchBooks, searchMovies } from "@/lib/search";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const kind = parseKind(sp.get("kind") ?? undefined);
  const q = (sp.get("q") ?? "").trim();
  if (!kind || !q) return NextResponse.json({ hits: [] });
  try {
    const hits = kind === "movie" ? await searchMovies(q) : await searchBooks(q);
    return NextResponse.json({ hits });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
