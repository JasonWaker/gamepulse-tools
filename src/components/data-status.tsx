import Link from "next/link";
import type { Entity } from "@/lib/registry";
export function DataStatus({ records }: { records: Entity[] }) {
  if (!records.length) return null;
  const dates = [...new Set(records.map((e) => e.verified_at))].sort();
  return (
    <aside className="source-summary">
      <strong>
        {records.length} sourced records · Snapshot, not live game data
      </strong>
      <p>
        Checked {dates[0]}
        {dates.length > 1 ? ` – ${dates.at(-1)}` : ""}.{" "}
        {records.some((e) => e.entity_type === "creatures")
          ? "Creature records use the official pre-release index. "
          : ""}
        {records.some((e) => typeof e.data_json.price === "number")
          ? "Prices and base stats are community-recorded beta figures; launch values may change. "
          : ""}
        Each detail page links to its source. Unknown fields are not estimated.
      </p>
      <Link href="/data-sources">Coverage & update policy ↗</Link>
    </aside>
  );
}
