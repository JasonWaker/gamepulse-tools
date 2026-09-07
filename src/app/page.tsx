import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Crosshair,
  Database,
  Layers,
  Bookmark,
} from "lucide-react";
import { games, tools, entities, toolHref } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { Cover, EntityArt } from "@/components/catalog-art";
import { SectionTitle, ToolCard } from "@/components/shared";
import { presets } from "@/lib/equipment";
export const metadata = { alternates: { canonical: siteConfig.url } };
export default function Home() {
  return (
    <div className="page-container dashboard">
      <div className="dashboard-heading">
        <div>
          <small className="overline">YOUR NEXT SESSION STARTS HERE</small>
          <h1>
            Make every play count<span>.</span>
          </h1>
          <p>Game databases, smarter builds, and a plan worth saving.</p>
        </div>
        <Link href="/library" className="button secondary">
          <Bookmark size={16} />
          My toolkit
        </Link>
      </div>
      <div className="editorial-grid">
        <Link className="spotlight" href={toolHref(tools[0])}>
          <Cover game="wardogs" priority />
          <div className="spotlight-shade" />
          <div className="spotlight-top">
            <span className="badge">FEATURED COMPANION</span>
            <span>PC · EARLY ACCESS SEP 10</span>
          </div>
          <div className="spotlight-copy">
            <small>WARDOGS / DEPLOYMENT PLANNER</small>
            <h2>
              BUILD YOUR KIT.
              <br />
              KEEP YOUR EDGE.
            </h2>
            <p>
              Pick your weapons. Pack your gear. Know what every deployment
              costs.
            </p>
            <span className="button primary">
              Build a loadout <ArrowUpRight size={18} />
            </span>
          </div>
          <span className="image-credit">
            Official press artwork © BULKHEAD / Team17
          </span>
        </Link>
        <div className="side-spotlights">
          {games.slice(1).map((g) => (
            <Link
              key={g.id}
              className="side-spotlight"
              href={`/games/${g.slug}`}
            >
              <Cover game={g.id} priority />
              <div className="spotlight-shade" />
              <div>
                <small>
                  {g.id === "aniimo"
                    ? "24 COMPANIONS · TEAM PLANNER"
                    : "ROBLOX · PERSONAL PROGRESS"}
                </small>
                <h2>{g.name}</h2>
                <p>
                  {g.id === "aniimo"
                    ? "Find your next adventure crew."
                    : "Turn the grind into a game plan."}{" "}
                  <ArrowUpRight size={16} />
                </p>
              </div>
              {g.id === "aniimo" && (
                <span className="image-credit">
                  Original adventure illustration
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
      <div className="quick-access">
        {[
          {
            icon: Crosshair,
            label: "Loadout planner",
            sub: "Equipment + cash budget",
            href: toolHref(tools[0]),
          },
          {
            icon: Database,
            label: "Weapon database",
            sub: "7 weapons · sourced beta stats",
            href: "/games/wardogs/weapons",
          },
          {
            icon: Layers,
            label: "Team builder",
            sub: "24 companions · 4 planning slots",
            href: toolHref(tools[2]),
          },
          {
            icon: Bookmark,
            label: "Your saved toolkit",
            sub: "Favorites & saved builds",
            href: "/library",
          },
        ].map((x) => (
          <Link key={x.label} href={x.href}>
            <x.icon size={21} />
            <span>
              <strong>{x.label}</strong>
              <small>{x.sub}</small>
            </span>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
      <section className="section">
        <SectionTitle
          eyebrow="PICK UP & PLAY"
          title="Start with a loadout"
          href={toolHref(tools[0])}
          label="Open builder"
        />
        <div className="preset-grid">
          {presets.map((p, i) => (
            <Link
              href={`${toolHref(tools[0])}?preset=${p.id}`}
              className="preset-card"
              key={p.id}
            >
              <Cover src={`/media/${p.image}.webp`} />
              <span className="preset-number">0{i + 1}</span>
              <div>
                <small>GAMEPULSE STARTER BUILD</small>
                <h3>
                  {p.name}
                  <ArrowUpRight size={19} />
                </h3>
                <p>{p.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="THE ARMORY"
          title="Know what you're bringing"
          href="/games/wardogs/weapons"
          label="Browse database"
        />
        <div className="catalog-grid home-armory">
          {entities
            .filter((e) => e.entity_type === "weapons")
            .slice(0, 4)
            .map((e) => (
              <Link
                className="catalog-card"
                key={e.id}
                href={`/games/${e.game_id}/${e.entity_type}/${e.slug}`}
              >
                <EntityArt entity={e} />
                <div className="catalog-card-body">
                  <small>{String(e.data_json.category)}</small>
                  <h3>
                    {e.name}
                    <ArrowUpRight size={16} />
                  </h3>
                  <div className="card-stats">
                    <span>
                      DMG <b>{e.data_json.damage}</b>
                    </span>
                    <span>
                      RPM <b>{e.data_json.rpm}</b>
                    </span>
                    <strong>
                      ${Number(e.data_json.price).toLocaleString("en-US")}
                    </strong>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        <p className="source-note">
          Community-recorded Closed Alpha/Beta stats · Original equipment
          illustrations · Figures may change at launch.
        </p>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="FIVE TOOLS. ZERO SIGN-UPS."
          title="A better way to prepare"
          href="/tools"
          label="All tools"
        />
        <div className="tool-grid">
          {tools.slice(0, 4).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
