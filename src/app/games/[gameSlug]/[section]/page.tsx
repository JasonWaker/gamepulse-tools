import Link from "next/link";
import { notFound } from "next/navigation";
import {
  games,
  getGame,
  gameEntities,
  gameTools,
  toolHref,
} from "@/lib/registry";
import { Breadcrumbs, EmptyState, AdSlot } from "@/components/shared";
import { siteConfig } from "@/lib/config";
export function generateStaticParams() {
  return games.flatMap((g) =>
    ["database", "codes", "guides", ...g.entityTypes].map((section) => ({
      gameSlug: g.slug,
      section,
    })),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string; section: string }>;
}) {
  const { gameSlug, section } = await params;
  const es = gameEntities(
    gameSlug,
    section === "database" ? undefined : section,
  );
  return {
    title: `${getGame(gameSlug)?.name} ${section}`,
    robots: { index: es.length > 0, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/games/${gameSlug}/${section}/`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ gameSlug: string; section: string }>;
}) {
  const { gameSlug, section } = await params;
  const g = getGame(gameSlug);
  if (
    !g ||
    !["database", "codes", "guides", ...g.entityTypes].includes(section)
  )
    notFound();
  const es = gameEntities(g.id, section === "database" ? undefined : section);
  return (
    <div className="page-container inner-page">
      <Breadcrumbs
        items={[
          { label: g.name, href: `/games/${g.slug}` },
          { label: section },
        ]}
      />
      <small className="overline">{g.name} / VERIFIED SOURCES</small>
      <h1 className="capitalize">
        {section === "database" ? "The database." : section}
      </h1>
      <p className="lead">
        {section === "codes"
          ? "Only verified, active codes belong here. No invented rewards."
          : section === "guides"
            ? "Practical help, when there is enough verified information to be useful."
            : "A growing collection of official records. Missing stats are clearly marked."}
      </p>
      {section === "database" && (
        <nav className="tool-dock">
          {g.entityTypes.map((type) => (
            <Link key={type} href={`/games/${g.slug}/${type}`}>
              {type} ↗
            </Link>
          ))}
        </nav>
      )}
      {es.length ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: es.map((e, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: e.name,
                  url: `${siteConfig.url}/games/${g.slug}/${e.entity_type}/${e.slug}/`,
                })),
              }),
            }}
          />
          <div className="entity-grid">
            {es.map((e) => (
              <Link
                key={e.id}
                className="entity-card"
                href={`/games/${g.slug}/${e.entity_type}/${e.slug}`}
              >
                <small>NO. {String(e.data_json.index).padStart(3, "0")}</small>
                <div className="creature-symbol">✧</div>
                <h3>{e.name}</h3>
                <p>Official index · Combat stats pending</p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            section === "codes"
              ? "No verified active codes yet."
              : "Data not available yet."
          }
          description="We will add records when a reliable source is confirmed. This page does not imply that no such content exists in the game."
        />
      )}
      <AdSlot />
      <div className="media-section">
        <div>
          <h2>Build a plan while you explore.</h2>
          <p>The companion tools work with your own observations.</p>
        </div>
        <Link className="button primary" href={toolHref(gameTools(g.id)[0])}>
          Open planner ↗
        </Link>
      </div>
      <p className="source-note">
        Official source: <a href={g.official_url}>{g.name} ↗</a> · Reviewed{" "}
        {g.verified_at}
      </p>
    </div>
  );
}
