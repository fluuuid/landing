#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec4 uLogoRect;
uniform sampler2D uLogo;
uniform float uTime;
uniform float uGlitch;
uniform float uTear;
uniform float uDamage;
uniform float uMotion;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float logo(vec2 uv) {
  vec2 local = (uv - uLogoRect.xy) / max(uLogoRect.zw, vec2(.00001));
  if (local.x < 0. || local.x > 1. || local.y < 0. || local.y > 1.) return 0.;
  return texture2D(uLogo, local).a;
}

// Damage is measured in logo space so the same cuts work on a phone and desktop.
vec2 fracture(vec2 uv, float frame, float damage) {
  vec2 size = max(uLogoRect.zw, vec2(.00001));
  vec2 local = (uv - uLogoRect.xy) / size;
  float row = floor(local.y * 13.);
  float cut = hash(vec2(row, frame + 19.));
  float glyph = floor(local.x * 7.);
  float glyphSeed = hash(vec2(glyph + 3., floor(frame / 2.)));

  // Cut and pull strips of the lettering, then kick individual glyph fragments.
  local.x += (cut - .5) * .64 * damage * step(.38, cut);
  local.y += (glyphSeed - .5) * .7 * damage * step(.46, glyphSeed);
  local.x += (local.y - .5) * (glyphSeed - .5) * .35 * damage;
  float pull = step(.76, hash(vec2(row + 8., frame)));
  local.x = (local.x - .5) / (1. + pull * damage * .9) + .5;

  // Block resampling creates rough, broken edges during the strongest bursts.
  float blocks = step(.6, damage) * step(.65, hash(vec2(frame, 23.)));
  vec2 grid = vec2(160., 18.);
  local = mix(local, floor(local * grid) / grid, blocks * .76);
  return uLogoRect.xy + local * size;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.);
  vec2 px = 1. / uResolution;
  float frame = floor(uTime * 25.);
  float g = uGlitch;
  float tear = uTear;
  float damage = uDamage;
  vec2 q = uv;

  // Tear the full frame independently from the more violent logo distortion.
  float coarse = floor(uv.y * 24.);
  float bandSeed = hash(vec2(coarse, frame));
  float band = step(.64, bandSeed);
  float fineRow = floor(gl_FragCoord.y / 2.);
  float fineSeed = hash(vec2(fineRow, frame));
  float shift = (bandSeed - .5) * .24 * band * tear;
  shift += (fineSeed - .5) * .014 * g * step(.36, fineSeed);
  q.x += shift;
  q.y += (hash(vec2(frame, 31.)) - .5) * .1 * tear;
  q = (q - .5) / (1. + g * .08) + .5;

  vec2 p = (q - .5) * aspect;
  float glow = exp(-length((q - vec2(.51, 1.1)) * vec2(1.05, 1.35)) * 2.9);
  float vignette = 1. - smoothstep(.18, 1.17, length(p * vec2(.72, 1.15)));
  float bg = (.018 + glow * .065) * vignette;
  bg += exp(-length(p * vec2(1.2, 2.5)) * 5.) * .01;
  bg += exp(-length((uv - uPointer) * aspect) * 3.5) * .012 * uMotion;

  float leakX = hash(vec2(floor(frame / 3.), 9.));
  float leak = exp(-abs(q.x - leakX) * 6.);
  float gate = step(.48, hash(vec2(floor(frame / 2.), 71.)));
  bg += leak * tear * gate * .32;
  float wideBand = step(.82, hash(vec2(floor(q.y * 11.), floor(frame / 2.))));
  bg += wideBand * tear * (.045 + leak * .14);
  bg *= 1. - band * tear * .6;

  vec2 broken = q;
  float echoes = 0.;
  float shreds = 0.;
  float abrasion = 1.;
  if (g > .001 || damage > .001) {
    broken = fracture(q, frame, damage);
    float direction = hash(vec2(frame, 4.)) > .45 ? 1. : -1.;
    float spacing = uLogoRect.z * (.014 + damage * .035) * max(g, damage);
    // Uneven, opposed trails replace the evenly spaced copies of a clean wordmark.
    for (int i = 1; i <= 9; i++) {
      float n = float(i);
      float jitter = hash(vec2(n, frame));
      float flip = i > 6 ? -1. : 1.;
      vec2 trail = vec2(direction * flip * spacing * (n + jitter * 1.8),
                        (jitter - .5) * uLogoRect.w * damage * .42);
      float copy = logo(broken + trail);
      float ink = .4 + .6 * hash(vec2(floor(gl_FragCoord.x / 3.), fineRow + n));
      echoes = max(echoes, copy * (1. - n / 12.) * max(g, damage) * ink * .9);
    }

    // Isolated ripped slivers escape above and below the mark.
    float fragmentMask = step(.81, hash(floor(gl_FragCoord.xy / vec2(6., 2.)) + frame));
    shreds = logo(broken + uLogoRect.zw * vec2(.17, .48));
    shreds = max(shreds, logo(broken - uLogoRect.zw * vec2(.12, .38)));
    shreds *= fragmentMask * damage * .72;
    float inkCell = hash(floor(gl_FragCoord.xy / vec2(2., 1.)) + frame);
    float gouge = step(.9, hash(vec2(floor(gl_FragCoord.x / 5.), floor(gl_FragCoord.y / 3.) + frame)));
    abrasion = 1. - damage * (.62 * step(.7, inkCell) + .3 * gouge);
  }

  float mark = logo(broken);
  float soft = logo(broken + vec2(px.x * 2., 0.)) + logo(broken - vec2(px.x * 2., 0.));
  soft += logo(broken + vec2(0., px.y * 2.)) + logo(broken - vec2(0., px.y * 2.));
  float dropout = mix(1., .42, step(.78, fineSeed) * g);
  float stencil = max(mark * dropout * abrasion, echoes);
  // The faint original returns between hard hits, under the torn overprint.
  if (damage > .001) {
    float recovery = (1. - smoothstep(.32, .85, damage)) * .86 * (1. - damage * .8);
    stencil = max(stencil, logo(q) * recovery);
  }
  float choke = 1. - damage * step(.8, hash(vec2(floor(uv.y * uResolution.y / 4.), frame))) * .78;
  float value = bg + (stencil + shreds) * choke * .91 + soft * .02;

  // Signal grit is concentrated around the damaged lettering.
  vec2 center = uLogoRect.xy + uLogoRect.zw * .5;
  vec2 radius = (uv - center) / max(uLogoRect.zw * vec2(.75, 2.), vec2(.00001));
  float halo = exp(-dot(radius, radius) * 1.8);
  float dust = step(.996, hash(gl_FragCoord.xy + frame * 7.));
  value += dust * halo * damage * .2;

  vec2 cell = floor(uv * vec2(160., 88.));
  vec2 local = fract(uv * vec2(160., 88.));
  float seed = hash(cell);
  float scratch = step(.979, seed) * step(local.y, .12) * step(local.x, .55);
  scratch *= step(.4, hash(cell + floor(frame / 2.))) * g;
  float line = step(.996, hash(vec2(fineRow, frame))) * tear;
  float block = step(.94, hash(vec2(floor(uv.x * 18.), coarse + frame)));
  value += scratch * .26 + line * .13;
  value *= 1. - block * band * tear * .65;
  value += (hash(gl_FragCoord.xy + mod(frame, 100.)) - .5) * (.006 + g * .032);
  gl_FragColor = vec4(vec3(max(value, 0.)), 1.);
}
