"use client";
import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { canDisplay, type Media } from "@/lib/media";
import type { Game } from "@/lib/registry";
import { Atmosphere } from "./atmosphere";
export function GameMedia({ media, game }: { media: Media; game: Game }) {
  const [failed, setFailed] = useState(false);
  if (
    !canDisplay(media) ||
    failed ||
    !media.external_url ||
    media.type === "video"
  )
    return <Atmosphere game={game} />;
  return (
    <div className="media-image" style={{ aspectRatio: media.aspect_ratio }}>
      <Image
        src={media.external_url}
        alt={media.attribution_text}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
export function GameTrailer({ media, game }: { media: Media; game: Game }) {
  const [play, setPlay] = useState(false);
  if (
    !canDisplay(media) ||
    media.type !== "video" ||
    !media.is_official ||
    !media.video_id ||
    !/^[-\w]{11}$/.test(media.video_id)
  )
    return null;
  return (
    <div className="trailer">
      {play ? (
        <iframe
          title={`${game.name} official trailer`}
          src={`https://www.youtube-nocookie.com/embed/${media.video_id}?autoplay=0`}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <>
          <Atmosphere game={game} />
          <button className="button primary" onClick={() => setPlay(true)}>
            <Play size={18} />
            Load official trailer
          </button>
        </>
      )}
    </div>
  );
}
