"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  X,
  ArrowUpRight,
  Menu,
  LayoutGrid,
  Crosshair,
  Bookmark,
  ChevronRight,
  Database,
  Info,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { games, tools, entities, toolHref, gameTools } from "@/lib/registry";
import { gameCodes } from "@/lib/codes";
import { Cover } from "./catalog-art";
export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
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
    ...entities.map((e) => ({
      name: e.name,
      href: `/games/${e.game_id}/${e.entity_type}/${e.slug}`,
      kind: String(e.data_json.category || e.data_json.type),
    })),
  ]
    .filter((x) =>
      (x.name + " " + x.kind).toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 24);
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="GamePulse Tools">
          <Activity />
          <span>
            GAMEPULSE<small>THE PLAYER’S TOOLKIT</small>
          </span>
        </Link>
        <button
          className="search-button"
          onClick={() => setOpen(true)}
          aria-label="Search games, equipment and tools"
        >
          <Search size={18} />
          <span>Search games, equipment, tools…</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="header-actions">
          <Link href="/library" className="library-button">
            <Bookmark size={16} />
            <span>My toolkit</span>
          </Link>
          <button
            className="mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
            aria-expanded={menu}
          >
            <Menu />
          </button>
        </div>
      </header>
      <aside className={`app-sidebar ${menu ? "is-open" : ""}`}>
        <nav aria-label="Main navigation">
          <small className="nav-label">WORKSPACE</small>
          {[
            { href: "/", label: "Overview", icon: LayoutGrid },
            { href: "/tools", label: "All tools", icon: Crosshair },
            { href: "/library", label: "My toolkit", icon: Bookmark },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              onClick={() => setMenu(false)}
              className={
                path === x.href || path === x.href + "/" ? "selected" : ""
              }
            >
              <x.icon size={18} />
              {x.label}
            </Link>
          ))}
          <small className="nav-label">
            YOUR GAMES <span>03</span>
          </small>
          {games.map((g) => (
            <div key={g.id} className="nav-game">
              <Link
                href={`/games/${g.slug}`}
                className={path.includes("/" + g.slug) ? "selected" : ""}
                onClick={() => setMenu(false)}
              >
                <Cover game={g.id} />
                <span>
                  {g.name}
                  <small>{g.platforms[0]}</small>
                </span>
                <ChevronRight size={13} />
              </Link>
              {path.includes("/" + g.slug) && (
                <div className="nav-game-tools">
                  {gameCodes(g.id).length > 0 && (
                    <Link
                      href={`/games/${g.slug}/codes`}
                      onClick={() => setMenu(false)}
                    >
                      Codes · Officially listed
                    </Link>
                  )}
                  {gameTools(g.id).map((t) => (
                    <Link
                      key={t.id}
                      href={toolHref(t)}
                      onClick={() => setMenu(false)}
                      className={path.includes(t.slug) ? "selected" : ""}
                    >
                      {t.name}
                    </Link>
                  ))}
                  {entities.some((e) => e.game_id === g.id) && (
                    <Link
                      href={`/games/${g.slug}/database`}
                      onClick={() => setMenu(false)}
                    >
                      <Database size={13} />
                      Database
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/about">
            <Info size={15} /> About & sources
          </Link>
          <Link href="/data-sources" onClick={() => setMenu(false)}>
            Data coverage & updates
          </Link>
          <Link href="/privacy">Privacy policy</Link>
        </div>
      </aside>
      {menu && (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={() => setMenu(false)}
        />
      )}
      <dialog
        ref={dialog}
        onCancel={() => setOpen(false)}
        className="search-dialog"
      >
        <div className="row">
          <Search />
          <input
            aria-label="Search catalog"
            placeholder="Try AK74, Fire, or team…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            aria-label="Close search"
            className="icon-button"
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
          {!results.length && <p>No matches. Try a weapon name or element.</p>}
        </div>
      </dialog>
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>
          GAMEPULSE <span className="muted">/ PLAYER TOOLS</span>
        </strong>
        <p>Independent companion. Game trademarks belong to their owners.</p>
      </div>
      <div className="footer-links">
        <Link href="/about">Sources & artwork</Link>
        <a href={siteConfig.github}>GitHub ↗</a>
        <span>v{siteConfig.version}</span>
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
