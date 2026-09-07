import Link from "next/link";
import { entities, games } from "@/lib/registry";
import { gameCodes } from "@/lib/codes";
import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "Data sources & coverage",
  description:
    "Where GamePulse data comes from, what is covered, and how snapshots are reviewed.",
  alternates: { canonical: `${siteConfig.url}/data-sources/` },
};
export default function Page() {
  return (
    <div className="page-container inner-page">
      <small className="overline">KNOW WHAT YOUR PLAN IS BUILT ON</small>
      <h1>Sources, not guesswork.</h1>
      <p className="lead">
        A useful estimate starts with honest inputs. Our catalog is a reviewed
        snapshot, not a connection to your game account or a live vendor feed.
      </p>
      {games.map((g) => {
        const records = entities.filter((e) => e.game_id === g.id);
        const codes = gameCodes(g.id);
        const groups = [...new Set(records.map((e) => e.entity_type))];
        return (
          <section className="panel" key={g.id}>
            <h2>{g.name}</h2>
            <p>
              {groups
                .map(
                  (t) =>
                    `${records.filter((e) => e.entity_type === t).length} ${t}`,
                )
                .join(" · ")}
              {codes.length
                ? `${records.length ? " · " : ""}${codes.length} officially listed codes`
                : ""}
            </p>
            <p>
              {records.length
                ? `Record checks: ${[...new Set(records.map((e) => e.verified_at))].join(", ")}. Every record retains its source and game-version context.`
                : "Progress tools use your own measurements. We do not have verified upgrade-cost tables, account progress or a complete pass catalog."}
            </p>
            <div className="tool-dock">
              {groups.map((t) => (
                <Link href={`/games/${g.slug}/${t}`} key={t}>
                  Browse {t} ↗
                </Link>
              ))}
              {codes.length > 0 && (
                <Link href={`/games/${g.slug}/codes`}>
                  View official code snapshot ↗
                </Link>
              )}
              <a href={g.official_url}>Official game site ↗</a>
            </div>
          </section>
        );
      })}
      <section className="panel">
        <h2>How updates reach the site</h2>
        <p>
          Source checks produce a candidate snapshot and a field-by-field change
          report. Changes are reviewed before entering the catalog and published
          with a new site release. Retrieval failures leave the published
          snapshot intact.
        </p>
        <p>
          Checks currently run on demand. The displayed date records the last
          source review, not a promise of daily updates. Beta records need
          another check after launch; they should not be treated as
          launch-verified prices.
        </p>
        <h3>What calculations include</h3>
        <p>
          Budget recommendations preserve occupied slots and ammunition box
          counts, apply the selected discount and reserve cash for identical
          rebuys. They search only this catalog. Locks take precedence over
          range and seat preferences. Lower cost does not imply equal combat
          performance.
        </p>
        <p>
          TTK uses base damage, fire rate and target health. It excludes armor,
          hit locations, distance falloff, ammunition effects, reloads and
          latency. Creature slots are a personal planning workspace, not a
          verified in-game party limit.
        </p>
        <h3>Artwork and coverage</h3>
        <p>
          Official promotional media, original illustrations and category
          symbols are labeled separately. The weapon and creature catalogs are
          partial. No growth scores or market-leadership claims are inferred
          from these records.
        </p>
        <Link className="text-link" href="/about">
          Artwork sources and attribution ↗
        </Link>
      </section>
    </div>
  );
}
