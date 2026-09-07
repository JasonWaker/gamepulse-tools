import pkg from "../../package.json";
export const siteConfig = {
  name: "GamePulse Tools",
  shortName: "GamePulse",
  tagline: "Get ahead of the game.",
  description:
    "Independent calculators, planners and databases for rising games. Plan your next loadout, build a creature team and track your progress.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://jasonwaker.github.io/gamepulse-tools",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  version: pkg.version,
  logo: "/icon.svg",
  github: "https://github.com/JasonWaker/gamepulse-tools",
  social: {},
};
export const asset = (path: string) => `${siteConfig.basePath}${path}`;
