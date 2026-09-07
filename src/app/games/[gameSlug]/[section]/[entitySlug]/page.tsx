import { EntityEvent } from "@/components/entity-event";
import Link from "next/link";
import { notFound } from "next/navigation";
import { entities, getGame, gameTools, toolHref } from "@/lib/registry";
import { Breadcrumbs } from "@/components/shared";
import { siteConfig } from "@/lib/config";
export function generateStaticParams() {
  return entities.map((e) => ({
    gameSlug: e.game_id,
    section: e.entity_type,
    entitySlug: e.slug,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string; section: string; entitySlug: string }>;
}) {
  const p = await params;
  const e = entities.find(
    (e) =>
      e.game_id === p.gameSlug &&
      e.entity_type === p.section &&
      e.slug === p.entitySlug,
  );
  return {
    title: e?.name || "Record unavailable",
    description: e?.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/games/${p.gameSlug}/${p.section}/${p.entitySlug}/`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ gameSlug: string; section: string; entitySlug: string }>;
}) {
  const p = await params;
  const e = entities.find(
    (e) =>
      e.game_id === p.gameSlug &&
      e.entity_type === p.section &&
      e.slug === p.entitySlug,
  );
  const g = getGame(p.gameSlug);
  if (!e || !g) notFound();
  return (
    <div className="page-container inner-page">
      <EntityEvent id={e.id} game={g.id} />
      <Breadcrumbs
        items={[
          { label: g.name, href: `/games/${g.slug}` },
          { label: e.entity_type, href: `/games/${g.slug}/${e.entity_type}` },
          { label: e.name },
        ]}
      />
      <small className="overline">
        OFFICIAL INDEX · NO. {String(e.data_json.index).padStart(3, "0")}
      </small>
      <h1>{e.name}</h1>
      <p className="lead">{e.description}</p>
      <div className="panel">
        <h2>Known information</h2>
        <div className="entity-stats">
          {Object.entries(e.data_json).map(([k, v]) => (
            <div key={k}>
              <span className="capitalize">{k}</span>
              <strong>{v ?? "Data not available yet."}</strong>
            </div>
          ))}
        </div>
        <p>
          No strengths, damage or skill coverage are inferred from the name or
          appearance.
        </p>
        <a href={e.source_url} className="text-link">
          View official source ↗
        </a>
        <p className="source-note">
          Verified {e.verified_at} · {e.game_version}
        </p>
      </div>
      <section className="section">
        <h2>Put this companion in your plan.</h2>
        {gameTools(g.id).map((t) => (
          <Link key={t.id} className="button primary" href={toolHref(t)}>
            {t.name} ↗
          </Link>
        ))}
      </section>
    </div>
  );
}
