# Media and source register · v0.1.0

## Visible assets

| Asset | Owner / source | Rights | Usage |
| --- | --- | --- | --- |
| Tactical topographic atmosphere | Original project CSS + SVG, `atmosphere.tsx` | approved | WARDOGS genre atmosphere; not a screenshot |
| Orbital energy atmosphere | Original project CSS, `atmosphere.tsx` | approved | Aniimo genre atmosphere; not character art |
| Geometric monolith atmosphere | Original project CSS, `atmosphere.tsx` | approved | Agartha genre atmosphere; not game UI |
| Site mark | Original SVG, `public/icon.svg` | approved | Platform mark |
| Social preview | Original SVG rasterized to PNG, `public/og.png` | approved | Link previews |
| UI icons | Lucide, installed npm package, ISC license | approved | Original open-source icon library |

## Source-only references

| Game | Official source | Rights | Status |
| --- | --- | --- | --- |
| WARDOGS | https://bulkhead.com/games/wardogs/ | review_required | Gallery reference; no downloaded image |
| Aniimo | https://aniimo.com/main | review_required | Official art reference; no downloaded image |
| Aniimo names | https://wiki.aniimo.com/ | factual index reference | Eight names/index numbers; no character art or guessed stats |
| Agartha Mog or Die | https://www.roblox.com/games/130641102725850/Agartha-Mog-or-Die | source reference only | Verified listing URL / place ID; no scraped HTML image |

Checked September 7, 2026. `verified_at` records source inspection, not a legal grant. The first two references live in `game_media`; nonmedia game/entity provenance lives in the relevant registry records.

## Providers

`RobloxMediaProvider.discover(universeId)` calls official games icons and game thumbnails endpoints, keeps the source URL and fetch timestamp, and does not download files. Resolve a place ID to a universe ID through the official Roblox API before calling it. Never pass a place ID as a universe ID.

`SteamMediaProvider.discover(appId)` discovers store metadata and media references. Every result is `review_required` until the publisher has granted appropriate reuse rights.

Neither provider is called during a visitor's initial page load. Neither automatically grants approval or mirrors media. `GameTrailer` uses `youtube-nocookie.com`, `autoplay=0`, and a CSS placeholder without thumbnail tracking requests. No official trailer has been selected yet, so no video is rendered.

## New-game discovery checklist

Record links or explicitly mark “not verified” for:

- Official website and developer/publisher.
- Official press kit, media kit, creator program and license text.
- Steam store and verified app ID, where applicable.
- Roblox listing, place ID and universe ID, where applicable.
- Official YouTube channel, selected video ID and official-channel evidence.
- Official X and Discord linked by the developer.

For every approved media item record `source_owner`, `source_url`, `license_note`, `usage_rights`, attribution, dimensions, type, rights status, verification date, and local storage path or external URL. Do not approve an image simply because it is public.

Local media review uses `npm run admin:media`. Keep the evidence note in version control. Review decisions require a rebuild before they can affect public output. `review_required` and `rejected` images must never render, including on error fallbacks.

## Verified platform identifiers

- WARDOGS Steam app ID: `1867240`. Official Steam appdetails API reports a planned September 10, 2026 release (coming_soon=true), checked September 7. This supersedes the older developer-page status.
- Agartha place ID: `130641102725850`; universe ID: `10571722689`, resolved with `https://apis.roblox.com/universes/v1/places/130641102725850/universe`.
