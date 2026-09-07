import Link from "next/link";
import { notFound } from "next/navigation";
import { entities, getGame, gameTools, toolHref } from "@/lib/registry";
import { Breadcrumbs } from "@/components/shared";
import { EntityArt } from "@/components/catalog-art";
import { EntityEvent } from "@/components/entity-event";
import { siteConfig } from "@/lib/config";
import { timeToKill, stat, money } from "@/lib/equipment";
export function generateStaticParams() {
  return entities.map((e) => ({
    gameSlug: e.game_id,
    section: e.entity_type,
    entitySlug: e.slug,
  }));
}
type Params = { gameSlug: string; section: string; entitySlug: string };
const find = (p: Params) =>
  entities.find(
    (e) =>
      e.game_id === p.gameSlug &&
      e.entity_type === p.section &&
      e.slug === p.entitySlug,
  );
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const p = await params,
    e = find(p);
  return {
    title: e?.name || "Record unavailable",
    description: e?.description,
    robots: { index: e?.entity_type === "weapons", follow: true },
    alternates: {
      canonical: `${siteConfig.url}/games/${p.gameSlug}/${p.section}/${p.entitySlug}/`,
    },
  };
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params,
    e = find(p),
    g = getGame(p.gameSlug);
  if (!e || !g) notFound();
  const ts = gameTools(g.id);
  const labels: Record<string, string> = {
    seats: "Recorded seats",
    category: "Category",
    slot: "Loadout slot",
    price: "Purchase price",
    damage: "Base damage",
    rpm: "Rate of fire",
    range: "Effective range",
    velocity: "Muzzle velocity",
    accuracy: "Accuracy (lower = tighter)",
    ammo_price: "Standard ammo / box",
    index: "Official index",
    type: "Elements",
    role: "Role",
    stage: "Stage",
  };
  const units: Record<string, string> = {
    rpm: " rpm",
    range: " m",
    velocity: " m/s",
    accuracy: " mrad",
  };
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
      <div className="entity-detail-grid">
        <aside className="entity-profile">
          <EntityArt entity={e} />
          <div className="entity-profile-copy">
            <small className="overline">
              {String(e.data_json.category || e.data_json.type)}
            </small>
            <h2>{e.name}</h2>
            <Link
              className="button primary"
              href={`${toolHref(ts[0])}?item=${e.id}`}
            >
              {e.entity_type === "creatures" ? "Add to team" : "Add to loadout"}{" "}
              ↗
            </Link>
            {ts
              .filter(
                (t) =>
                  t.tool_type === "comparator" && e.entity_type === "weapons",
              )
              .map((t) => (
                <Link
                  key={t.id}
                  className="button secondary"
                  href={`${toolHref(t)}?item=${e.id}`}
                >
                  Compare weapon ↗
                </Link>
              ))}
            <p className="source-note">
              {e.entity_type === "creatures"
                ? "Original elemental emblem · not character artwork"
                : "Original equipment illustration · not an in-game model"}
            </p>
          </div>
        </aside>
        <section className="entity-details">
          <small className="overline">{g.name} / DATABASE</small>
          <h1>{e.name}</h1>
          <p>{e.description}</p>
          <h2>Record details</h2>
          <div className="entity-stats">
            {Object.entries(e.data_json)
              .filter(([k]) => labels[k])
              .map(([k, v]) => (
                <div key={k}>
                  <span>{labels[k]}</span>
                  <strong>
                    {k === "price" || k === "ammo_price"
                      ? money(Number(v))
                      : String(v) + (units[k] || "")}
                  </strong>
                </div>
              ))}
          </div>
          {e.entity_type === "weapons" && (
            <div className="panel">
              <small className="overline">CALCULATED PERFORMANCE</small>
              <h3>
                {Math.round(timeToKill(stat(e, "damage"), stat(e, "rpm"), 100))}{" "}
                ms to 100 HP
              </h3>
              <p>
                {Math.ceil(100 / stat(e, "damage"))} base-damage hits. First
                shot is at time zero. This estimate excludes armor, range
                falloff, reloads and latency. Open the comparator to adjust
                target health and compare curves.
              </p>
              <Link
                className="text-link"
                href={`${toolHref(ts.find((t) => t.tool_type === "comparator")!)}?item=${e.id}`}
              >
                Explore side-by-side comparison ↗
              </Link>
            </div>
          )}
          <div className="panel">
            <small className="overline">DATA PROVENANCE</small>
            <h3>
              {e.entity_type === "creatures"
                ? "Official pre-release index"
                : "Community-recorded beta data"}
            </h3>
            <p>{e.game_version}</p>
            <a className="text-link" href={e.source_url}>
              View source record ↗
            </a>
            <p className="source-note">
              Checked {e.verified_at}. Figures can change as the game develops.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
