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
    is_primary: true,
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
