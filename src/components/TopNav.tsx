import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/insights", label: "Insights" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wet-market", label: "Wet Market" },
  { href: "/products", label: "Products" },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/40 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="nav-link-transition group flex items-baseline gap-2 transition-opacity duration-300 hover:opacity-90"
        >
          <span className="text-base font-semibold tracking-tight text-mint">
            Gusto mo ng mura?
          </span>
          <span className="hidden text-xs text-mint/60 transition-colors duration-300 group-hover:text-mint/90 sm:inline">
            Metro Manila wet market prices
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="nav-link-transition rounded-full px-3 py-2 text-sm font-medium text-mint/85 transition-all duration-300 ease-out hover:bg-jade/15 hover:text-mint active:scale-[0.98]"
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
