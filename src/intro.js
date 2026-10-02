// Sharp attacks and longer releases retain the impact without holding whole frames.
export const INTRO_DURATION = 2.88;
const cues = [
  [0, 0.85, 0.9, 0.7],
  [0.12, 1, 0.9, 1],
  [0.28, 0.3, 0.15, 0.16],
  [0.4, 0.65, 0.55, 0.82],
  [0.52, 1, 0.82, 0.96],
  [0.76, 0.95, 1, 0.58],
  [0.96, 0.35, 0.2, 0.2],
  [1.12, 0.95, 0.9, 1],
  [1.32, 0.3, 0.1, 0.22],
  [1.55, 0.85, 0.7, 0.88],
  [1.72, 1, 1, 1],
  [1.92, 0.9, 0.9, 0.76],
  [2.12, 0.8, 0.7, 1],
  [2.3, 0.36, 0.08, 0.24],
  [2.48, 0.24, 0, 0.72],
  [2.56, 0, 0, 0],
  [2.66, 0.14, 0, 0.12],
  [2.74, 0, 0, 0],
];
function ease(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}
export function introAt(seconds) {
  if (seconds < 0 || seconds >= INTRO_DURATION)
    return { glitch: 0, tear: 0, damage: 0 };
  let index = cues.length - 1;
  while (index > 0 && seconds < cues[index][0]) index--;
  const cue = cues[index];
  const previous = cues[Math.max(0, index - 1)];
  const values = cue.slice(1).map((target, channel) => {
    const from = previous[channel + 1];
    const duration = target > from ? 0.036 : 0.08;
    return from + (target - from) * ease((seconds - cue[0]) / duration);
  });
  // The pulse runs continuously across cues. Fast ruptures have a smooth recoil.
  const pulse =
    0.42 + 0.58 * (0.5 + 0.5 * Math.cos(seconds * Math.PI * 12.5)) ** 2;
  const pulsing = ease((values[2] - 0.5) / 0.35);
  return {
    glitch: values[0],
    tear: values[1],
    damage: values[2] * (1 + (pulse - 1) * pulsing),
  };
}
