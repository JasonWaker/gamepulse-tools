import type { MetadataRoute } from "next";
import { games, tools, toolHref, entities } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/games",
    "/tools",
    "/trending",
    "/about",
    "/privacy",
    "/data-sources",
    "/games/agartha-mog-or-die/codes",
    "/games/wardogs/vehicles",
    ...games.flatMap((g) => [`/games/${g.slug}`, `/games/${g.slug}/tools`]),
    ...tools.map(toolHref),
    "/games/wardogs/database",
    "/games/wardogs/weapons",
    "/games/wardogs/equipment",
    ...entities
      .filter((e) => e.entity_type === "weapons")
      .map((e) => `/games/${e.game_id}/${e.entity_type}/${e.slug}`),
    "/games/aniimo/database",
    "/games/aniimo/creatures",
  ].map((path) => ({
    url: `${siteConfig.url}${path}/`,
    lastModified: "2026-09-07",
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path.includes("/tools/") ? 0.9 : 0.7,
  }));
}
