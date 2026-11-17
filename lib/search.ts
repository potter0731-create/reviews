import type { Kind } from "./types";

export interface SearchHit {
  kind: Kind;
  providerId: string;
  title: string;
  originalTitle?: string;
  creator: string;
  year?: number;
  poster: string | null;
}

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

function tmdbHeaders(): HeadersInit {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error("TMDB_TOKEN 이 설정되지 않았어요 (직접 입력은 가능해요)");
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

export async function searchMovies(q: string): Promise<SearchHit[]> {
  const url = `https://api.themoviedb.org/3/search/movie?language=ko-KR&include_adult=false&query=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: tmdbHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB 검색 실패 (${res.status})`);
  const json = (await res.json()) as {
    results: {
      id: number;
      title: string;
      original_title: string;
      release_date?: string;
      poster_path: string | null;
    }[];
  };
  return json.results.slice(0, 12).map((m) => ({
    kind: "movie",
    providerId: String(m.id),
    title: m.title,
    originalTitle: m.original_title !== m.title ? m.original_title : undefined,
    creator: "", // 감독은 선택 시 detail 로 채움
    year: m.release_date ? Number(m.release_date.slice(0, 4)) || undefined : undefined,
    poster: m.poster_path ? TMDB_IMG + m.poster_path : null,
  }));
}

export async function movieDirector(id: string): Promise<string> {
  const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}/credits?language=ko-KR`;
  const res = await fetch(url, { headers: tmdbHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB 상세 실패 (${res.status})`);
  const json = (await res.json()) as { crew: { job: string; name: string }[] };
  return json.crew
    .filter((c) => c.job === "Director")
    .map((c) => c.name)
    .join(", ");
}

export async function searchBooks(q: string): Promise<SearchHit[]> {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) throw new Error("KAKAO_REST_KEY 가 설정되지 않았어요 (직접 입력은 가능해요)");
  const url = `https://dapi.kakao.com/v3/search/book?size=12&query=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`책 검색 실패 (${res.status})`);
  const json = (await res.json()) as {
    documents: {
      title: string;
      authors: string[];
      datetime: string;
      thumbnail: string;
      isbn: string;
    }[];
  };
  return json.documents.map((b) => ({
    kind: "book",
    providerId: b.isbn.split(" ").pop() || b.isbn,
    title: b.title,
    creator: b.authors.join(", "),
    year: Number(b.datetime.slice(0, 4)) || undefined,
    poster: b.thumbnail || null,
  }));
}
