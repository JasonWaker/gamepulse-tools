import codes from "@/data/codes.json";
export type GameCode = (typeof codes)[number];
export const gameCodes = (gameId: string) =>
  codes.filter((c) => c.game_id === gameId);
