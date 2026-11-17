import { isAdmin } from "@/lib/auth";
import { movieDirector } from "@/lib/search";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  try {
    return NextResponse.json({ creator: await movieDirector(id) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
