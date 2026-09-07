export const nonnegative = (n: number) =>
  Number.isFinite(n) ? Math.max(0, n) : 0;
export function loadoutTotal(costs: number[], budget: number) {
  const total = costs.reduce((a, b) => a + nonnegative(b), 0);
  return {
    total,
    remaining: nonnegative(budget) - total,
    over: total > nonnegative(budget),
    percent:
      budget > 0 ? Math.min(100, (total / budget) * 100) : total > 0 ? 100 : 0,
  };
}
export function ttk(damage: number, rpm: number, health: number) {
  if (
    !Number.isFinite(damage) ||
    !Number.isFinite(rpm) ||
    !Number.isFinite(health) ||
    damage <= 0 ||
    rpm <= 0 ||
    health <= 0
  )
    return null;
  return (Math.max(0, Math.ceil(health / damage) - 1) * 60) / rpm;
}
export function grind(
  current: number,
  target: number,
  rate: number,
  multiplier: number,
) {
  if (
    ![current, target, rate, multiplier].every(Number.isFinite) ||
    rate <= 0 ||
    multiplier < 1
  )
    return null;
  const remaining = Math.max(0, target - current);
  return {
    remaining,
    base: remaining / rate,
    boosted: remaining / rate / multiplier,
    saved: (remaining / rate) * (1 - 1 / multiplier),
  };
}
export function progress(values: number[]) {
  const clean = values.map((n) => Math.min(100, nonnegative(n)));
  return {
    average: clean.reduce((a, b) => a + b, 0) / Math.max(1, clean.length),
    focus: clean.indexOf(Math.min(...clean)),
  };
}
