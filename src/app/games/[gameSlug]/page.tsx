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
  EmptyState,
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
            <Link
              className="button secondary"
              href={`/games/${g.slug}/database`}
            >
              View database
            </Link>
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
        <Link href={`/games/${g.slug}/database`}>
          <Database size={16} /> Database
        </Link>
        <Link href={`/games/${g.slug}/codes`}>Codes</Link>
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
          title="The database."
          href={`/games/${g.slug}/database`}
        />
        {es.length ? (
          <div className="entity-grid">
            {es.slice(0, 4).map((e) => (
              <Link
                className="entity-card"
                key={e.id}
                href={`/games/${g.slug}/${e.entity_type}/${e.slug}`}
              >
                <small>NO. {String(e.data_json.index).padStart(3, "0")}</small>
                <div className="creature-symbol">✧</div>
                <h3>{e.name}</h3>
                <p>Official index · Stats pending</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState description="Official stats are being verified. In the meantime, the calculators work with your own inputs." />
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
        {g.verified_at} · {g.game_version}. Artwork on this hub is an original
        abstract illustration, not game footage.
      </p>
    </div>
  );
}
