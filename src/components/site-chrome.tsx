"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, Search, X, ArrowUpRight, Menu } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { games, tools, toolHref } from "@/lib/registry";
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const results = [
    ...games.map((g) => ({
      name: g.name,
      href: `/games/${g.slug}`,
      kind: "Game hub",
    })),
    ...tools.map((t) => ({ name: t.name, href: toolHref(t), kind: t.game_id })),
  ].filter((x) =>
    (x.name + x.kind).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label={siteConfig.name}>
          <Activity />
          <span>
            {siteConfig.shortName}
            <small>TOOLS</small>
          </span>
        </Link>
        <nav
          className={menu ? "main-nav expanded" : "main-nav"}
          aria-label="Main navigation"
        >
          <Link
            onClick={() => setMenu(false)}
            className={pathname === "/games/" ? "active" : ""}
            href="/games"
          >
            Discover games
          </Link>
          <Link onClick={() => setMenu(false)} href="/tools">
            All tools
          </Link>
          <Link onClick={() => setMenu(false)} href="/trending">
            On our radar <span className="tiny-dot" />
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="search-button"
            onClick={() => setOpen(true)}
            aria-label="Search games and tools"
          >
            <Search size={16} />
            <span>Search anything</span>
            <kbd>⌘ K</kbd>
          </button>
          <a className="version" href={`${siteConfig.github}/releases`}>
            v{siteConfig.version}
          </a>
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        onCancel={() => setOpen(false)}
        className="search-dialog"
      >
        <div className="row">
          <Search />
          <input
            autoFocus
            aria-label="Search games and tools"
            placeholder="Find your game or tool…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="search-results">
          {results.map((x) => (
            <Link onClick={() => setOpen(false)} key={x.href} href={x.href}>
              <span>
                {x.name}
                <small>{x.kind}</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
          {!results.length && <p>No matches. Try a game name or “planner”.</p>}
        </div>
      </dialog>
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand">
          <Activity />
          <span>
            {siteConfig.shortName}
            <small>TOOLS</small>
          </span>
        </Link>
        <p>Get ahead. Play your way.</p>
      </div>
      <div className="footer-links">
        <Link href="/about">About & data policy</Link>
        <Link href="/privacy">Privacy</Link>
        <a href={siteConfig.github}>GitHub ↗</a>
      </div>
      <div className="footer-note">
        <span>
          Unofficial fan-made companion tools.
          <br />
          Game names, logos and related assets belong to their respective
          owners.
        </span>
        <span>
          © 2026 {siteConfig.shortName} · v{siteConfig.version}
        </span>
      </div>
    </footer>
  );
}
export function Analytics() {
  const [choice, setChoice] = useState<string | null>("pending");
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setChoice(localStorage.getItem("gp-analytics"));
      } catch {
        setChoice("no");
      }
    });
  }, []);
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_ID;
    if (choice !== "yes" || !id || !/^G-[A-Z0-9]+$/.test(id)) return;
    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function (...args: unknown[]) {
      w.dataLayer!.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", id);
    const s = document.createElement("script");
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    s.async = true;
    document.head.appendChild(s);
    return () => s.remove();
  }, [choice]);
  if (!process.env.NEXT_PUBLIC_GA_ID || choice) return null;
  return (
    <aside className="consent">
      Allow anonymous usage analytics to help improve tools?
      <button
        onClick={() => {
          localStorage.setItem("gp-analytics", "no");
          setChoice("no");
        }}
      >
        Decline
      </button>
      <button
        onClick={() => {
          localStorage.setItem("gp-analytics", "yes");
          setChoice("yes");
        }}
      >
        Allow
      </button>
    </aside>
  );
}
