import { Cover } from "./catalog-art";
import type { Game } from "@/lib/registry";
export function Atmosphere({
  game,
  large = false,
}: {
  game: Game;
  large?: boolean;
}) {
  return (
    <div className={`atmosphere photographic ${large ? "large" : ""}`}>
      <Cover game={game.id} />
      <div className="cover-shade" />
    </div>
  );
}
