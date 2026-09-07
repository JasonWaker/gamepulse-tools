import decisions from "@/data/media-decisions.json";
export type Rights = "approved" | "embed_only" | "review_required" | "rejected";
export type Media = {
  id: string;
  game_id: string;
  type: "hero" | "thumbnail" | "video" | "background";
  source_type:
    | "manual"
    | "official_site"
    | "steam"
    | "roblox_api"
    | "youtube"
    | "press_kit";
  source_owner: string;
  source_url: string;
  external_url: string | null;
  storage_path: string | null;
  rights_status: Rights;
  license_note: string;
  attribution_text: string;
  width: number | null;
  height: number | null;
  aspect_ratio: string;
  is_primary: boolean;
  display_order: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  video_id?: string;
  channel_name?: string;
  is_official?: boolean;
};
export const media: Media[] = ["wardogs", "aniimo", "agartha-mog-or-die"].map(
  (id, i) => ({
    id: `${id}-atmosphere`,
    game_id: id,
    type: "background",
    source_type: "manual",
    source_owner: "GamePulse Tools contributors",
    source_url: "https://github.com/JasonWaker/gamepulse-tools",
    external_url: null,
    storage_path: null,
    rights_status: "approved",
    license_note:
      "Original CSS and SVG atmosphere created for this project. Not official game artwork.",
    attribution_text: "Original abstract companion artwork",
    width: null,
    height: null,
    aspect_ratio: "16/10",
    is_primary: false,
    display_order: i,
    verified_at: "2026-09-07",
    created_at: "2026-09-07",
    updated_at: "2026-09-07",
  }),
);
media.push({
  ...media[0],
  id: "wardogs-official-gallery",
  game_id: "wardogs",
  type: "hero",
  source_type: "official_site",
  source_owner: "BULKHEAD",
  source_url: "https://bulkhead.com/games/wardogs/",
  rights_status: "review_required",
  license_note:
    "Public gallery; reuse permission has not been confirmed. No image downloaded.",
  attribution_text: "© BULKHEAD",
  is_primary: false,
});
media.push({
  ...media[1],
  id: "aniimo-official-gallery",
  game_id: "aniimo",
  type: "hero",
  source_type: "official_site",
  source_owner: "Pawprint Studio / Kingsglory",
  source_url: "https://aniimo.com/main",
  rights_status: "review_required",
  license_note:
    "Official website reference only; reuse permission pending. No image downloaded.",
  attribution_text: "© respective owners",
  is_primary: false,
});

const kitSource = "https://www.team17.com/press-and-creator-hub";
for (const [name, kind] of [
  ["wardogs-hero", "hero"],
  ["wardogs-air", "thumbnail"],
  ["wardogs-street", "thumbnail"],
  ["wardogs-tank", "thumbnail"],
] as const) {
  media.push({
    ...media[0],
    id: name,
    type: kind,
    source_type: "press_kit",
    source_owner: "BULKHEAD / Team17",
    source_url: kitSource,
    storage_path: `/media/${name}.webp`,
    rights_status: "approved",
    license_note:
      "Official Team17 Press & Creator Hub supplies this WARDOGS kit for press/editorial coverage. Source archive: https://www.team17.com/hubfs/WARDOGS%20-%20Press%20Kit%20(Aug%2026).zip . Used for independent companion coverage with attribution.",
    attribution_text: "Official press artwork © BULKHEAD / Team17",
    is_primary: name === "wardogs-hero",
    width: name === "wardogs-hero" ? 1600 : 960,
    height: name === "wardogs-hero" ? 900 : 540,
  });
}
for (const [name, game] of [
  ["adventure", "aniimo"],
  ["equipment-atlas", "wardogs"],
  ["elements-atlas", "aniimo"],
])
  media.push({
    ...media[0],
    id: name,
    game_id: game,
    type: "background",
    storage_path: `/media/${name}.webp`,
    source_type: "manual",
    rights_status: "approved",
    is_primary: name === "adventure",
    license_note:
      "Original AI-generated illustration created for GamePulse with the built-in image generation tool. Not official game artwork. Prompts recorded in docs/MEDIA-v0.2.md.",
    attribution_text: "Original GamePulse illustration",
  });
media.push({
  ...media[2],
  id: "agartha-thumbnail-v2",
  type: "hero",
  source_type: "roblox_api",
  source_owner: "Roblox experience creator",
  source_url:
    "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=10571722689&countPerUniverse=3&size=768x432&format=Png&isCircular=false",
  external_url:
    "https://tr.rbxcdn.com/180DAY-d692aef0e7a4b4b7134901476fd37d5a/768/432/Image/Png/noFilter",
  rights_status: "embed_only",
  license_note:
    "Official Roblox thumbnail API presentation. Externally hosted platform thumbnail; not rehosted. Retrieved September 7, 2026.",
  attribution_text: "Thumbnail © respective Roblox experience creator",
  is_primary: true,
  width: 768,
  height: 432,
});
for (const m of media) {
  const d = (
    decisions as Record<
      string,
      { rights_status: Rights; license_note: string; verified_at: string }
    >
  )[m.id];
  if (d) Object.assign(m, d);
}
export const canDisplay = (m: Media) =>
  m.rights_status === "approved" || m.rights_status === "embed_only";
export class RobloxMediaProvider {
  async discover(universeId: number) {
    if (!Number.isSafeInteger(universeId) || universeId <= 0)
      throw new Error("A verified universe ID is required");
    const root = "https://thumbnails.roblox.com/v1/games";
    const urls = [
      `${root}/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`,
      `${root}/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=3&size=768x432&format=Png&isCircular=false`,
    ];
    return Promise.all(
      urls.map(async (url) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Roblox media: ${r.status}`);
        return {
          source: "roblox_api",
          source_url: url,
          fetched_at: new Date().toISOString(),
          data: await r.json(),
        };
      }),
    );
  }
}
export class SteamMediaProvider {
  async discover(appId: number) {
    if (!Number.isSafeInteger(appId) || appId <= 0)
      throw new Error("A verified Steam app ID is required");
    const source_url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const r = await fetch(source_url);
    if (!r.ok) throw new Error(`Steam media: ${r.status}`);
    return {
      source_url,
      rights_status: "review_required" as const,
      metadata: await r.json(),
    };
  }
}
