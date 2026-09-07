import type { MetadataRoute } from "next";
import { games, tools, toolHref } from "@/lib/registry";
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
    ...games.flatMap((g) => [`/games/${g.slug}`, `/games/${g.slug}/tools`]),
    ...tools.map(toolHref),
    "/games/aniimo/database",
    "/games/aniimo/creatures",
  ].map((path) => ({
    url: `${siteConfig.url}${path}/`,
    lastModified: "2026-09-07",
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path.includes("/tools/") ? 0.9 : 0.7,
  }));
}
