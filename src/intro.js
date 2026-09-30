// Screen interference and logo damage use separate intensities at the reference's 25 fps cadence.
export const INTRO_DURATION = 2.88;
const beats = [
  [0, 0.12, 0.85, 0.9, 0.7],
  [0.12, 0.28, 1, 0.9, 1],
  [0.28, 0.4, 0.3, 0.15, 0.16],
  [0.4, 0.52, 0.65, 0.55, 0.82],
  [0.52, 0.76, 1, 0.82, 0.96],
  [0.76, 0.96, 0.95, 1, 0.58],
  [0.96, 1.12, 0.35, 0.2, 0.2],
  [1.12, 1.32, 0.95, 0.9, 1],
  [1.32, 1.55, 0.3, 0.1, 0.22],
  [1.55, 1.72, 0.85, 0.7, 0.88],
  [1.72, 1.92, 1, 1, 1],
  [1.92, 2.12, 0.9, 0.9, 0.76],
  [2.12, 2.3, 0.8, 0.7, 1],
  [2.3, 2.48, 0.36, 0.08, 0.24],
  [2.48, 2.56, 0.24, 0, 0.72],
  [2.62, 2.7, 0.18, 0, 0.12],
  [2.78, 2.84, 0.12, 0, 0.06],
];
export function introAt(seconds) {
  const beat = beats.find(([start, end]) => seconds >= start && seconds < end);
  if (!beat) return { glitch: 0, tear: 0, damage: 0 };
  // Brief hard hits alternate with partial recoveries: keep the letterforms visible
  // between ruptures instead of dissolving the logo for the entire opening.
  const phase = Math.floor((seconds - beat[0]) * 25 + 0.0001) % 5;
  const pulse = phase === 0 ? 1 : phase === 3 ? 0.8 : 0.4;
  return {
    glitch: beat[2],
    tear: beat[3],
    damage: beat[4] > 0.7 ? beat[4] * pulse : beat[4],
  };
}
