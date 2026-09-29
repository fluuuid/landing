// Repeated bursts at the reference's 25 fps cadence, then a hard resolve.
export const INTRO_DURATION = 2.88;
const beats = [
  [0, 0.12, 0.85, 0.9],
  [0.12, 0.28, 1, 0.9],
  [0.28, 0.4, 0.3, 0.15],
  [0.4, 0.52, 0.65, 0.55],
  [0.52, 0.76, 1, 0.82],
  [0.76, 0.96, 0.95, 1],
  [0.96, 1.12, 0.35, 0.2],
  [1.12, 1.32, 0.95, 0.9],
  [1.32, 1.55, 0.3, 0.1],
  [1.55, 1.72, 0.85, 0.7],
  [1.72, 1.92, 1, 1],
  [1.92, 2.12, 0.9, 0.9],
  [2.12, 2.3, 0.8, 0.7],
  [2.3, 2.48, 0.36, 0.08],
  [2.62, 2.7, 0.18, 0],
  [2.78, 2.84, 0.12, 0],
];
export function introAt(seconds) {
  const beat = beats.find(([start, end]) => seconds >= start && seconds < end);
  return beat ? { glitch: beat[2], tear: beat[3] } : { glitch: 0, tear: 0 };
}
