import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Entry, Kind } from "./types";

export const DATA_FILE = path.join(process.cwd(), "data", "reviews.json");

export function sortEntries(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    const da = a.date ?? a.createdAt.slice(0, 10);
    const db = b.date ?? b.createdAt.slice(0, 10);
    return db.localeCompare(da) || b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getEntries(): Promise<Entry[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return sortEntries(JSON.parse(raw) as Entry[]);
  } catch {
    return [];
  }
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  return (await getEntries()).find((e) => e.id === id);
}

export function parseKind(v: string | undefined): Kind | undefined {
  return v === "movie" || v === "book" ? v : undefined;
}
