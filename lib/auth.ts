import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 이 설정되지 않았어요");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(
    createHmac("sha256", "pw").update(input).digest("hex"),
    createHmac("sha256", "pw").update(pw).digest("hex"),
  );
}

export function makeSession(): { value: string; maxAge: number } {
  const exp = String(Date.now() + MAX_AGE_SEC * 1000);
  return { value: `${exp}.${sign(exp)}`, maxAge: MAX_AGE_SEC };
}

export async function isAdmin(): Promise<boolean> {
  try {
    const value = (await cookies()).get(COOKIE)?.value;
    if (!value) return false;
    const [exp, sig] = value.split(".");
    if (!exp || !sig || Number(exp) < Date.now()) return false;
    return safeEqual(sig, sign(exp));
  } catch {
    return false;
  }
}
