import type { Kind } from "./types";

export interface SearchHit {
  kind: Kind;
  /** 목록에서 구분용 */
  providerId: string;
  title: string;
  originalTitle?: string;
  /** 영화는 감독, 책은 저자 */
  creator: string;
  year?: number;
  poster: string | null;
}

/** API 키 없이 쓸 수 있는 무료 검색만 사용한다 (영화: Apple iTunes, 책: Google Books → Open Library) */

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${new URL(url).hostname} ${res.status}`);
  return (await res.json()) as T;
}

const yearOf = (s?: string) => {
  const y = Number(s?.slice(0, 4));
  return Number.isInteger(y) && y > 0 ? y : undefined;
};

/* ───────── 영화: iTunes Search API ───────── */

interface ItunesMovie {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

export function parseItunes(json: { results?: ItunesMovie[] }): SearchHit[] {
  return (json.results ?? [])
    .filter((m) => m.trackName)
    .map((m) => ({
      kind: "movie" as const,
      providerId: String(m.trackId ?? m.trackName),
      title: m.trackName!,
      creator: m.artistName ?? "",
      year: yearOf(m.releaseDate),
      // 100px 썸네일 주소의 크기 부분만 바꾸면 큰 이미지를 받을 수 있다
      poster: m.artworkUrl100 ? m.artworkUrl100.replace(/\/\d+x\d+bb\./, "/600x900bb.") : null,
    }));
}

export async function searchMovies(q: string): Promise<SearchHit[]> {
  const url = `https://itunes.apple.com/search?media=movie&entity=movie&country=KR&lang=ko_kr&limit=12&term=${encodeURIComponent(q)}`;
  return parseItunes(await getJson(url));
}

/* ───────── 책: Google Books → Open Library ───────── */

interface GoogleVolumes {
  items?: {
    id: string;
    volumeInfo?: {
      title?: string;
      subtitle?: string;
      authors?: string[];
      publishedDate?: string;
      imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    };
  }[];
}

export function parseGoogleBooks(json: GoogleVolumes): SearchHit[] {
  return (json.items ?? [])
    .filter((b) => b.volumeInfo?.title)
    .map((b) => {
      const v = b.volumeInfo!;
      const img = v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail;
      return {
        kind: "book" as const,
        providerId: b.id,
        title: v.title!,
        creator: (v.authors ?? []).join(", "),
        year: yearOf(v.publishedDate),
        // http 주소는 https 사이트에서 막히므로 바꾸고, 모서리 말림 효과는 뺀다
        poster: img ? img.replace(/^http:/, "https:").replace("&edge=curl", "") : null,
      };
    });
}

interface OpenLibrarySearch {
  docs?: { key: string; title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number }[];
}

export function parseOpenLibrary(json: OpenLibrarySearch): SearchHit[] {
  return (json.docs ?? [])
    .filter((d) => d.title)
    .map((d) => ({
      kind: "book" as const,
      providerId: d.key,
      title: d.title!,
      creator: (d.author_name ?? []).join(", "),
      year: d.first_publish_year,
      poster: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
    }));
}

export async function searchBooks(q: string): Promise<SearchHit[]> {
  const enc = encodeURIComponent(q);
  try {
    const hits = parseGoogleBooks(
      await getJson(`https://www.googleapis.com/books/v1/volumes?printType=books&maxResults=12&q=${enc}`),
    );
    if (hits.length) return hits;
  } catch {
    // 키 없는 Google Books 는 하루 한도가 금방 찰 수 있어서 Open Library 로 넘어간다
  }
  return parseOpenLibrary(
    await getJson(
      `https://openlibrary.org/search.json?limit=12&fields=key,title,author_name,first_publish_year,cover_i&q=${enc}`,
    ),
  );
}
