import { Catalog } from "@/components/player-tools";
import Link from "next/link";
import { ArrowUpRight, Database } from "lucide-react";
import {
  games,
  getGame,
  gameTools,
  gameEntities,
  toolHref,
} from "@/lib/registry";
import { notFound } from "next/navigation";
import { Atmosphere } from "@/components/atmosphere";
import {
  Breadcrumbs,
  Badge,
  ToolCard,
  SectionTitle,
  AdSlot,
} from "@/components/shared";
import { siteConfig } from "@/lib/config";
export function generateStaticParams() {
  return games.map((g) => ({ gameSlug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const g = getGame(gameSlug);
  return {
    title: `${g?.name} companion tools`,
    description: g?.short_description,
    alternates: { canonical: `${siteConfig.url}/games/${gameSlug}/` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const g = getGame(gameSlug);
  if (!g) notFound();
  const ts = gameTools(g.id);
  const es = gameEntities(g.id);
  return (
    <div className="page-container">
      <Breadcrumbs
        items={[{ label: "Games", href: "/games" }, { label: g.name }]}
      />
      <section className="game-hero">
        <Atmosphere game={g} large />
        <div className="game-hero-copy">
          <Badge>{g.status}</Badge>
          <small className="overline">{g.eyebrow}</small>
          <h1>{g.name}</h1>
          <p>{g.short_description}</p>
          <div className="hero-actions">
            <Link className="button primary" href={toolHref(ts[0])}>
              Open {ts[0].name} <ArrowUpRight size={18} />
            </Link>
            {es.length > 0 && (
              <Link
                className="button secondary"
                href={`/games/${g.slug}/database`}
              >
                View database
              </Link>
            )}
          </div>
          <div className="hero-proof">
            <span>{g.platforms.join(" · ")}</span>
            <span>{ts.length} tools available</span>
            <span>Updated Sep 7, 2026</span>
          </div>
        </div>
      </section>
      <nav className="tool-dock" aria-label="Game navigation">
        {ts.map((t) => (
          <Link key={t.id} href={toolHref(t)}>
            {t.name}
            <ArrowUpRight size={15} />
          </Link>
        ))}
        {es.length > 0 && (
          <Link href={`/games/${g.slug}/database`}>
            <Database size={16} /> Database
          </Link>
        )}
      </nav>
      <section className="section">
        <SectionTitle
          eyebrow="YOUR COMPANION TOOLKIT"
          title="Make your next move."
        />
        <div className="tool-grid hub-tools">
          {ts.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>
      <AdSlot />
      <section className="section">
        <SectionTitle
          eyebrow="KNOW YOUR GAME"
          title={es.length ? "Explore the database" : "Your personal workspace"}
          href={es.length ? `/games/${g.slug}/database` : toolHref(ts[0])}
        />
        {es.length ? (
          <Catalog records={es.slice(0, 6)} />
        ) : (
          <div className="panel">
            <h2>Keep a record of every session.</h2>
            <p>
              Set personal milestones, log checkpoints, and compare time
              estimates using your observed resource rate.
            </p>
            <Link className="button primary" href={toolHref(ts[0])}>
              Open your progress workspace ↗
            </Link>
          </div>
        )}
      </section>
      <section className="media-section">
        <div>
          <small className="overline">STRAIGHT FROM THE SOURCE</small>
          <h2>Explore the official world.</h2>
          <p>See announcements and game media from the people building it.</p>
        </div>
        <a
          className="button secondary"
          href={g.official_url}
          target="_blank"
          rel="noreferrer"
        >
          Official {g.name} site <ArrowUpRight size={18} />
        </a>
      </section>
      <p className="source-note">
        Source: <a href={g.source_url}>{g.developer}</a> · Checked{" "}
        {g.verified_at} · {g.game_version}. WARDOGS media © BULKHEAD / Team17,
        from the official press kit. Aniimo cover is an original adventure
        illustration. Roblox thumbnail is hosted by Roblox.
      </p>
    </div>
  );
}
