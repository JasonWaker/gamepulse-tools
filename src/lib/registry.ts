export type Theme = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  panel_color: string;
  gradient: string;
  hero_overlay: string;
  texture: string;
  particle_style: string;
  font_style: string;
  hud_style: string;
};
export type Game = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  short_description: string;
  developer: string;
  publisher: string;
  platforms: string[];
  status: string;
  release_date: string | null;
  steam_app_id?: number;
  roblox_place_id?: number;
  roblox_universe_id?: number;
  official_url: string;
  entityTypes: string[];
  trend_score: number | null;
  opportunity_score: number | null;
  growth_status: string;
  discovery_source: string;
  priority: number;
  theme: Theme;
  art: string;
  monogram: string;
  source_url: string;
  verified_at: string;
  game_version: string;
};
const theme = (primary: string, secondary: string, hud: string): Theme => ({
  primary_color: primary,
  secondary_color: secondary,
  accent_color: primary,
  background_color: "#090b0e",
  panel_color: "#12161c",
  gradient: `radial-gradient(ellipse at 80% 20%, ${secondary}55, transparent 70%)`,
  hero_overlay: "linear-gradient(90deg,#090b0e,transparent)",
  texture: "grid",
  particle_style: "ambient",
  font_style: "display",
  hud_style: hud,
});
export const games: Game[] = [
  {
    id: "wardogs",
    slug: "wardogs",
    name: "WARDOGS",
    eyebrow: "TACTICAL ALL-OUT WARFARE",
    short_description:
      "Every decision has a cost. Make your next deployment count.",
    developer: "BULKHEAD",
    publisher: "Team17",
    platforms: ["PC"],
    status: "Release soon",
    release_date: "2026-09-10",
    steam_app_id: 1867240,
    official_url: "https://bulkhead.com/games/wardogs/",
    entityTypes: ["weapons", "vehicles"],
    trend_score: null,
    opportunity_score: null,
    growth_status: "Editorial watchlist",
    discovery_source: "Official developer website",
    priority: 1,
    theme: theme("#ff8a42", "#647451", "tactical"),
    art: "tactical",
    monogram: "W",
    source_url: "https://store.steampowered.com/app/1867240/WARDOGS/",
    verified_at: "2026-09-07",
    game_version: "Steam Early Access release scheduled September 10, 2026",
  },
  {
    id: "aniimo",
    slug: "aniimo",
    name: "Aniimo",
    eyebrow: "A WORLD WORTH DISCOVERING",
    short_description:
      "Meet your next companions. Plan a team before the adventure begins.",
    developer: "Pawprint Studio",
    publisher: "Kingsglory",
    platforms: ["PC", "Console", "Mobile"],
    status: "Release soon",
    release_date: "2026-09-16",
    official_url: "https://aniimo.com/main",
    entityTypes: ["creatures"],
    trend_score: null,
    opportunity_score: null,
    growth_status: "Editorial watchlist",
    discovery_source: "Official announcement",
    priority: 2,
    theme: theme("#7be6e0", "#3d62ab", "collection"),
    art: "orbital",
    monogram: "A",
    source_url: "https://aniimo.com/main",
    verified_at: "2026-09-07",
    game_version: "Pre-release; mobile September 23",
  },
  {
    id: "agartha-mog-or-die",
    slug: "agartha-mog-or-die",
    name: "Agartha",
    eyebrow: "MOG OR DIE · ROBLOX",
    short_description:
      "Set your next milestone. Turn your grind into a game plan.",
    developer: "See Roblox listing",
    publisher: "See Roblox listing",
    platforms: ["Roblox"],
    status: "On Roblox",
    roblox_place_id: 130641102725850,
    roblox_universe_id: 10571722689,
    release_date: null,
    official_url:
      "https://www.roblox.com/games/130641102725850/Agartha-Mog-or-Die",
    entityTypes: ["items", "passes"],
    trend_score: null,
    opportunity_score: null,
    growth_status: "Editorial watchlist",
    discovery_source: "Official Roblox experience",
    priority: 3,
    theme: theme("#c3f66b", "#467e32", "arcade"),
    art: "monolith",
    monogram: "AG",
    source_url:
      "https://www.roblox.com/games/130641102725850/Agartha-Mog-or-Die",
    verified_at: "2026-09-07",
    game_version: "Not supplied by source",
  },
];
export type ToolKind = "loadout" | "comparator" | "team" | "progress" | "pass";
export type ToolDefinition = {
  id: string;
  game_id: string;
  slug: string;
  name: string;
  tool_type: ToolKind;
  short_description: string;
  status: string;
  version: string;
  is_featured: boolean;
  config_json: Record<string, unknown>;
  updated_at: string;
};
export const tools: ToolDefinition[] = [
  {
    id: "loadout",
    game_id: "wardogs",
    slug: "loadout-planner",
    name: "Loadout & Cash Planner",
    tool_type: "loadout",
    short_description:
      "Build your kit. Balance your budget. Deploy with a plan.",
    status: "NEW",
    version: "0.1.0",
    is_featured: true,
    config_json: {
      slots: ["Primary weapon", "Secondary", "Utility", "Armor", "Vehicle"],
    },
    updated_at: "2026-09-07",
  },
  {
    id: "compare",
    game_id: "wardogs",
    slug: "weapon-comparator",
    name: "Weapon Comparator",
    tool_type: "comparator",
    short_description:
      "Compare your weapon stats side by side, before you commit.",
    status: "NEW",
    version: "0.1.0",
    is_featured: true,
    config_json: {},
    updated_at: "2026-09-07",
  },
  {
    id: "team",
    game_id: "aniimo",
    slug: "team-planner",
    name: "Team Planner",
    tool_type: "team",
    short_description:
      "Four slots. Endless possibilities. Pick your adventure crew.",
    status: "NEW",
    version: "0.1.0",
    is_featured: true,
    config_json: { slots: 4 },
    updated_at: "2026-09-07",
  },
  {
    id: "progress",
    game_id: "agartha-mog-or-die",
    slug: "progress-planner",
    name: "Progress Planner",
    tool_type: "progress",
    short_description:
      "Track your stats and choose your next personal milestone.",
    status: "NEW",
    version: "0.1.0",
    is_featured: true,
    config_json: { stats: ["Height", "Face", "Frame", "Bodyfat"] },
    updated_at: "2026-09-07",
  },
  {
    id: "pass",
    game_id: "agartha-mog-or-die",
    slug: "pass-calculator",
    name: "Progress / Pass Calculator",
    tool_type: "pass",
    short_description:
      "See what a boost could save, using your observed rates.",
    status: "NEW",
    version: "0.1.0",
    is_featured: false,
    config_json: {},
    updated_at: "2026-09-07",
  },
];
export type Entity = {
  id: string;
  game_id: string;
  entity_type: string;
  slug: string;
  name: string;
  data_json: Record<string, string | number | null>;
  source_url: string;
  verified_at: string;
  game_version: string;
  description: string;
};
export const entities: Entity[] = [
  "Emberpup",
  "Flameruff",
  "Scorchhowl",
  "Inferlupa",
  "Celestis",
  "Stellarys",
  "Chirpi",
  "Tromber",
].map((name, i) => ({
  id: `aniimo-${i + 1}`,
  game_id: "aniimo",
  entity_type: "creatures",
  slug: name.toLowerCase(),
  name,
  data_json: { index: i + 1, type: null, skills: null },
  source_url: "https://wiki.aniimo.com/",
  verified_at: "2026-09-07",
  game_version: "Official pre-release index",
  description: `${name} is listed as No. ${String(i + 1).padStart(3, "0")} in the official Aniimo index. Add this companion to your planning roster. Combat details are awaiting verification.`,
}));
export const getGame = (slug: string) => games.find((g) => g.slug === slug);
export const gameTools = (id: string) => tools.filter((t) => t.game_id === id);
export const gameEntities = (id: string, type?: string) =>
  entities.filter((e) => e.game_id === id && (!type || e.entity_type === type));
export const toolHref = (t: ToolDefinition) =>
  `/games/${t.game_id}/tools/${t.slug}`;

/** Unknown official channels remain null until verified from a primary source. */
export const gameMediaSources = Object.fromEntries(
  games.map((game) => [
    game.id,
    {
      official_website: game.official_url,
      steam_url: game.steam_app_id
        ? `https://store.steampowered.com/app/${game.steam_app_id}/`
        : null,
      official_youtube: null,
      official_x: null,
      official_discord: null,
      press_kit_url: null,
      roblox_url: game.roblox_place_id
        ? `https://www.roblox.com/games/${game.roblox_place_id}/`
        : null,
    },
  ]),
);
