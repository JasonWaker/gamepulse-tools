"use client";
import dynamic from "next/dynamic";
import type { ToolDefinition } from "@/lib/registry";
const Workbench = dynamic(
  () => import("./tool-workbench").then((m) => m.ToolWorkbench),
  { loading: () => <div className="skeleton" aria-label="Loading tool" /> },
);
export function ToolLoader({ tool }: { tool: ToolDefinition }) {
  return <Workbench key={tool.id} tool={tool} />;
}
