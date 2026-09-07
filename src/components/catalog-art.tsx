"use client";
import { useState } from "react";
import {
  Shield,
  BriefcaseMedical,
  HardHat,
  Crosshair,
  Car,
} from "lucide-react";
import type { Entity } from "@/lib/registry";
import { media, canDisplay } from "@/lib/media";
import { asset } from "@/lib/config";
export const covers: Record<string, string> = {
  wardogs: "/media/wardogs-street.webp",
  aniimo: "/media/adventure.webp",
  "agartha-mog-or-die":
    "https://tr.rbxcdn.com/180DAY-d692aef0e7a4b4b7134901476fd37d5a/768/432/Image/Png/noFilter",
};
export function Cover({
  game,
  className = "",
  src,
  alt = "",
  priority = false,
}: {
  game?: string;
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const url = src || covers[game || "wardogs"];
  const record = media.find(
    (m) => m.storage_path === url || m.external_url === url,
  );
  if (failed || (record && !canDisplay(record)))
    return (
      <div className={`cover-fallback ${className}`}>
        <span>{game === "agartha-mog-or-die" ? "AGARTHA" : "GAMEPULSE"}</span>
      </div>
    );
  // Native images support official externally hosted platform thumbnails in the static export.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`cover-image ${className}`}
      src={url.startsWith("/") ? asset(url) : url}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
export function EntityArt({ entity: e }: { entity: Entity }) {
  const id =
    e.entity_type === "weapons"
      ? "equipment-atlas"
      : e.entity_type === "creatures"
        ? "elements-atlas"
        : null;
  const registered = media.find((m) => m.id === id);
  if (registered && !canDisplay(registered))
    return (
      <div className="item-art gear-art">
        <span>Artwork unavailable</span>
      </div>
    );
  if (e.entity_type === "weapons" && typeof e.data_json.art !== "number") {
    return (
      <div
        className="item-art gear-art"
        role="img"
        aria-label={`${e.name}, category symbol; game artwork unavailable`}
      >
        <Crosshair size={65} strokeWidth={1} />
        <span className="art-index">{e.data_json.category}</span>
      </div>
    );
  }
  if (e.entity_type === "weapons") {
    const n = Number(e.data_json.art);
    return (
      <div
        role="img"
        aria-label={`${e.name}, original equipment illustration`}
        className="item-art weapon-art"
        style={{
          backgroundImage: `url(${asset("/media/equipment-atlas.webp")})`,
          backgroundPosition: `${(n % 3) * 50}% ${Math.floor(n / 3) * 50}%`,
        }}
      />
    );
  }
  if (e.entity_type === "creatures") {
    const type =
      String(e.data_json.type)
        .split(" / ")
        .find((t) =>
          ["Fire", "Dark", "Wind", "Grass", "Water", "Ice"].includes(t),
        ) || "Grass";
    const n = Math.max(
      0,
      ["Fire", "Dark", "Wind", "Grass", "Water", "Ice"].indexOf(type),
    );
    return (
      <div
        role="img"
        aria-label={`${type} element emblem, not character artwork`}
        className="item-art element-art"
        style={{
          backgroundImage: `url(${asset("/media/elements-atlas.webp")})`,
          backgroundPosition: `${(n % 3) * 50}% ${Math.floor(n / 3) * 100}%`,
        }}
      >
        <span className="art-index">
          {String(e.data_json.index).padStart(3, "0")}
        </span>
      </div>
    );
  }
  const Icon =
    e.data_json.slot === "Vehicle"
      ? Car
      : e.data_json.slot === "Helmet"
        ? HardHat
        : e.data_json.slot === "Utility"
          ? BriefcaseMedical
          : Shield;
  return (
    <div className="item-art gear-art">
      <Icon size={65} strokeWidth={1} />
    </div>
  );
}
