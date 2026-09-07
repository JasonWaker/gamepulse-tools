# Media register · v0.2.0

All files referenced by the website live in `public/media`. Runtime rights decisions are honored by cover and catalog artwork components. Original element emblems are not character portraits; original equipment illustrations are not game models.

## Official editorial artwork

The [Team17 Press & Creator Hub](https://www.team17.com/press-and-creator-hub) provides the [WARDOGS press kit](https://www.team17.com/hubfs/WARDOGS%20-%20Press%20Kit%20(Aug%2026).zip) for press/creator coverage. Selected files were extracted from the public kit (the large video was not downloaded). The site credits BULKHEAD / Team17. This is an editorial usage basis, not an ownership claim or general asset redistribution license.

- `wardogs-hero.webp`: `WD_RevealKeyArt_1440p.png`, 1600 px derivative.
- `wardogs-street.webp`: `WD_Screenshot_ResidentialStreet_1_WD1.jpg`, 960 px derivative.
- `wardogs-air.webp`: `WD_Screenshot_Flying_WD1.jpg`, 960 px derivative.
- `wardogs-tank.webp`: `WD_Screenshot_Tank_1_WD1.jpg`, 960 px derivative.
- `wardogs-logo.svg`: supplied white fullmark; retained in the kit selection.

Agartha artwork uses an external Roblox thumbnail returned by the [official thumbnail API](https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=10571722689&countPerUniverse=3&size=768x432&format=Png&isCircular=false). Universe ID 10571722689 corresponds to place 130641102725850. Retrieved 2026-09-07. The thumbnail is not mirrored; unavailable or rejected assets show a local fallback.

## Original generated artwork

Created with the built-in image generation tool on 2026-09-07, inspected, and saved into the project as WebP. The site does not use competitor code, artwork, or copied editorial descriptions.

1. `public/media/adventure.webp` — prompt:
   “Use case: stylized-concept. Create a polished wide 16:9 editorial fantasy adventure illustration for an independent game companion website. Lush floating islands, huge ancient stone arch, turquoise river, luminous sunlit clouds, tiny original fluffy orange foxlike companion and small blue round winged creature looking into valley in lower right. Painterly premium 3D animation game key art with rich foliage, teal shadows, warm sunlight, detailed textured environment. Strong readable silhouettes. Landscape fills frame. No text, no logos, no UI. Original world and original creature designs, not actual game footage. This asset will illustrate a creature collecting team planner.”
2. `public/media/equipment-atlas.webp` — prompt:
   “Use case: product-mockup. One weapon identification illustration atlas image for a game equipment database. Exactly 3 columns and 3 rows equal size cells, 9 separate side-profile objects completely inside own cell. Flat uniform dark charcoal #171c20 background. No grid lines. Each weapon centered pointing right, occupies 85% width. Top row left AK-74 wood stock curved magazine; top center M4 rifle telescoping stock quad rail; top right MP5 black submachine gun. Middle row left M1911 steel pistol wood grips; center Glock17 black pistol; right Mosin Nagant long bolt action wooden rifle. Bottom row left PKM machine gun wood stock bipod; center SVD wood stock long scope rifle; right Galil rifle black skeletal stock. Photorealistic product illustration, crisp metallic edges, subtly worn surfaces, soft studio rim lighting. No text, no bullets, no characters, no logos, no watermark. These are independently illustrated real-world object likenesses, not screenshots or game asset reproductions.”
   Only the seven cells corresponding to sourced catalog records are shown. Atlas regions are displayed using CSS positioning.
3. `public/media/elements-atlas.webp` — prompt:
   “Use case: stylized-concept. Create a single 3 columns by 2 rows atlas of six beautiful 3D fantasy elemental collectible emblems for a game team planning UI. Exact equal cells, each emblem centered isolated on same very dark navy #121820 background. Top left luminous orange flame crystal, top middle violet crescent dark magic crystal, top right turquoise wind spiral feathers; bottom left bright green leaves emerald seed, bottom middle blue water droplet sapphire, bottom right frosty pale blue ice crystal. Premium stylized game inventory art, detailed sculptural material, clear silhouette, dramatic glow, each object fills 60% of own cell with empty margins. No text, letters, logos, borders, UI. Emblems represent types, not characters.”

## Game data

`src/data/catalog.json` contains row-level source, check date, data-version labels and original descriptions.

- Seven weapon records and three gear price records are curated from community-reported Closed Alpha/Beta observations on WardogsHQ. They are **not official launch-confirmed stats**. Each weapon points to its individual source page; armor/helmet/bandage prices point to the builds page. Ratings and recommendations were not copied.
- Twenty-four Aniimo records use names, index numbers, types, roles and stages from the official wiki. Editorial descriptions were independently written. The official character images were not downloaded; website availability alone was not treated as permission.
- Four team slots are a **personal planning layout**, not a claim about the game's party-size limit. Coverage lists elemental/role variety, not unverified battle synergy.
- No new game codes, recoil stats, attachment compatibility, pass prices or protection effectiveness are invented.

The old v0.1 abstract assets remain historical registry entries for auditing. They are no longer the primary public artwork.
