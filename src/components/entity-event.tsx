"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
export function EntityEvent({ id, game }: { id: string; game: string }) {
  useEffect(() => {
    track("entity_view", id, { entity_id: id, game });
  }, [id, game]);
  return null;
}
