import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getEntries } from "@/lib/data";
import { AdminApp } from "./AdminApp";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;
  return <AdminApp initial={await getEntries()} />;
}
