import { entities, type Entity } from "./registry";
export const equipment = entities.filter(
  (e) => typeof e.data_json.price === "number",
);
export const weapons = equipment.filter((e) => e.entity_type === "weapons");
export const slots = [
  "Primary",
  "Secondary",
  "Armor",
  "Helmet",
  "Utility",
  "Vehicle",
];
export const presets = [
  {
    id: "balanced",
    name: "Field essentials",
    caption: "Rifle, sidearm & protection",
    image: "wardogs-street",
    items: [
      "wd-ak74",
      "wd-m1911",
      "wd-medium-armor",
      "wd-medium-helmet",
      "wd-bandage",
    ],
  },
  {
    id: "light",
    name: "Travel light",
    caption: "A smaller investment per run",
    image: "wardogs-air",
    items: ["wd-mp5", "wd-m1911", "wd-bandage"],
  },
  {
    id: "support",
    name: "Sustained fire",
    caption: "LMG with a complete backup kit",
    image: "wardogs-tank",
    items: [
      "wd-pkm",
      "wd-m1911",
      "wd-medium-armor",
      "wd-medium-helmet",
      "wd-bandage",
    ],
  },
];
export const money = (v: number) =>
  "$" + v.toLocaleString("en-US", { maximumFractionDigits: 2 });
export const stat = (e: Entity, key: string) => Number(e.data_json[key] || 0);
export function kitCost(
  ids: string[],
  ammo: Record<string, number>,
  discount = false,
) {
  return (
    ids.reduce((sum, id) => {
      const e = equipment.find((x) => x.id === id);
      return (
        sum +
        (e
          ? stat(e, "price") +
            stat(e, "ammo_price") *
              Math.min(99, Math.max(0, Number(ammo[id]) || 0))
          : 0)
      );
    }, 0) * (discount ? 0.5 : 1)
  );
}
export function timeToKill(damage: number, rpm: number, health: number) {
  return damage > 0 && rpm > 0
    ? (Math.max(0, Math.ceil(health / damage) - 1) * 60000) / rpm
    : 0;
}
