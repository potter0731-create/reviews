import Link from "next/link";

const NAV = [
  { href: "/", label: "전체" },
  { href: "/?kind=movie", label: "영화" },
  { href: "/?kind=book", label: "책" },
  { href: "/want", label: "찜" },
  { href: "/quotes", label: "문장" },
  { href: "/stats", label: "통계" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          보고 <span className="text-accent">읽고</span>
        </Link>
        <nav className="flex gap-4 overflow-x-auto text-sm text-muted">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
