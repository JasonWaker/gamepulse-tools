import type { Game } from "@/lib/registry";
export function Atmosphere({
  game,
  large = false,
}: {
  game: Game;
  large?: boolean;
}) {
  return (
    <div
      className={`atmosphere ${game.art} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      <div className="art-grid" />
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      {game.art === "tactical" ? (
        <svg className="terrain" viewBox="0 0 800 500" fill="none">
          <g stroke="currentColor" strokeWidth="1.1">
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d={`M${80 - i * 22} 500 Q${100 + i * 12} ${200 - i * 12} 320 ${210 - i * 12} T${680 + i * 8} ${50 - i * 7} L850 50`}
              />
            ))}
            <circle cx="480" cy="230" r="100" />
            <circle cx="480" cy="230" r="135" strokeDasharray="3 8" />
            <path d="M480 80V180M480 280V380M330 230H430M530 230H630" />
          </g>
          <path d="M456 247L480 196L504 247L480 236Z" fill="currentColor" />
          <text
            x="510"
            y="205"
            fill="currentColor"
            fontSize="10"
            letterSpacing="3"
          >
            DEPLOYMENT ZONE
          </text>
        </svg>
      ) : game.art === "orbital" ? (
        <div className="planet">
          <div />
          <span />
        </div>
      ) : (
        <div className="monolith-shape">
          <i />
          <i />
          <i />
        </div>
      )}
      <span className="art-coordinate">{game.eyebrow}</span>
      <span className="art-index">0{game.priority} / GP</span>
    </div>
  );
}
