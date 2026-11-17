export type Kind = "movie" | "book";
export type Status = "done" | "want";

export interface Quote {
  text: string;
  note?: string;
}

export interface Entry {
  id: string;
  kind: Kind;
  title: string;
  originalTitle?: string;
  /** 영화는 감독, 책은 저자 */
  creator: string;
  year?: number;
  poster: string | null;
  status: Status;
  /** 0.5 ~ 5, 0.5 단위 */
  rating?: number;
  oneLine?: string;
  review?: string;
  /** 본/읽은 날짜 (YYYY-MM-DD) */
  date?: string;
  quotes: Quote[];
  createdAt: string;
  updatedAt: string;
}

export const KIND_LABEL: Record<Kind, string> = { movie: "영화", book: "책" };
export const VERB: Record<Kind, string> = { movie: "본", book: "읽은" };
export const WANT_LABEL: Record<Kind, string> = { movie: "보고싶은", book: "읽고싶은" };
