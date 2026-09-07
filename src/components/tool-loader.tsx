"use client";
import dynamic from "next/dynamic";
import type { ToolDefinition } from "@/lib/registry";
const Player = dynamic(
  () => import("./player-tools").then((m) => m.PlayerWorkbench),
  { loading: () => <div className="skeleton" aria-label="Loading tool" /> },
);
export function ToolLoader({ tool }: { tool: ToolDefinition }) {
  return <Player key={tool.id} tool={tool} />;
}
