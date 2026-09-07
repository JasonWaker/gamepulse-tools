import { getGame } from "@/lib/registry";
import { notFound } from "next/navigation";
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const game = getGame(gameSlug);
  if (!game) notFound();
  return (
    <div
      className={`game-theme theme-${game.art}`}
      style={
        {
          "--accent": game.theme.primary_color,
          "--secondary": game.theme.secondary_color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
