export const cx = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const dateAdd = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

export function calcStreak(dots: { visited: boolean }[]) {
  let current = 0,
    longest = 0,
    run = 0;
  for (const d of dots) {
    if (d.visited) {
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  for (let i = dots.length - 1; i >= 0; i--) {
    if (dots[i].visited) current++;
    else break;
  }
  return { current, longest };
}
