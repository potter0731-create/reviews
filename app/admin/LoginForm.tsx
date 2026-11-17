"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setErr((await res.json().catch(() => ({}))).error ?? "로그인 실패");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xs space-y-3 py-20">
      <h1 className="text-lg font-bold">관리자 로그인</h1>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="비밀번호"
        autoFocus
        className="w-full rounded-md border border-line bg-card px-3 py-2 outline-none focus:border-accent"
      />
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      <button disabled={busy || !pw} className="w-full rounded-md bg-accent py-2 font-medium text-black disabled:opacity-50">
        {busy ? "확인 중…" : "들어가기"}
      </button>
    </form>
  );
}
