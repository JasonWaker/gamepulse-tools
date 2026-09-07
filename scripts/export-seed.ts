import { writeFileSync } from "node:fs";
import { games, tools, entities, gameMediaSources } from "../src/lib/registry";
import { media } from "../src/lib/media";
const q = (x: unknown) =>
  x === null || x === undefined
    ? "null"
    : typeof x === "boolean"
      ? String(x)
      : typeof x === "number"
        ? String(x)
        : "'" +
          (typeof x === "string" ? x : JSON.stringify(x)).replaceAll(
            "'",
            "''",
          ) +
          "'";
const insert = (table: string, rows: Record<string, unknown>[]) =>
  rows
    .map(
      (row) =>
        `insert into public.${table} (${Object.keys(row).join(",")}) values (${Object.values(row).map(q).join(",")}) on conflict (id) do nothing;`,
    )
    .join("\n");
const text = [
  insert(
    "games",
    games.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      short_description: g.short_description,
      developer: g.developer,
      publisher: g.publisher,
      status: g.status,
      release_date: g.release_date,
      steam_app_id: g.steam_app_id,
      roblox_place_id: g.roblox_place_id,
      roblox_universe_id: g.roblox_universe_id,
      platforms: `{${g.platforms.join(",")}}`,
      official_url: g.official_url,
      theme_json: g.theme,
      media_sources_json: gameMediaSources[g.id],
      priority: g.priority,
      growth_status: g.growth_status,
      discovery_source: g.discovery_source,
      published: true,
    })),
  ),
  insert(
    "tools",
    tools.map((t) => ({ ...t, status: "published" })),
  ),
  insert("game_media", media),
  insert(
    "game_entities",
    entities.map(({ description, ...e }) => ({
      ...e,
      data_json: { ...e.data_json, description },
      published: true,
      content_complete: false,
    })),
  ),
].join("\n\n");
writeFileSync(
  "supabase/seed.sql",
  `-- GamePulse Tools v0.1.0; generated from registry\n${text}\n`,
);
