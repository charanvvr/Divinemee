import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const source = path.join(root, 'public', 'images');
const output = path.join(source, 'hero-sequence');

// Every layer is either a resolution-independent gradient or a high-res
// cutout rendered at or below its native size — nothing upscales, so frames
// stay sharp even on dense displays.
const DESKTOP = { width: 2400, height: 1500, frames: 64, kind: 'desktop', quality: 94 };
const MOBILE = { width: 1080, height: 1620, frames: 36, kind: 'mobile', quality: 92 };

// Act timeline (mirrored in components/sections/Hero.tsx)
const ACT = {
  growEnd: 0.45, // jar grows toward camera while salt pours
  wipeStart: 0.45, // lavender -> rose vertical wipe
  wipeEnd: 0.7,
  finalStart: 0.78, // both products resolve together
  finalEnd: 0.92,
};

const ease = (v) => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3);
const easeInOut = (v) => {
  const t = Math.max(0, Math.min(1, v));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const span = (p, from, to) => clamp((p - from) / (to - from));
const lerpHex = (a, b, t) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(mix(v, pb[i], t)).toString(16).padStart(2, '0')).join('')}`;
};

const [lavenderCut, roseCut, pairCut] = await Promise.all([
  fs.readFile(path.join(source, 'cutouts', 'lavender-bliss.png')),
  fs.readFile(path.join(source, 'cutouts', 'rose-magic.png')),
  fs.readFile(path.join(source, 'cutouts', 'jar-pair.png')),
]);

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(path.join(output, 'desktop'), { recursive: true });
await fs.mkdir(path.join(output, 'mobile'), { recursive: true });

// Clean studio backdrop — layered gradients, zero photographic noise.
// mood 0 = lavender dawn, 1 = rose warmth, 2 = candlelit finale.
function backdrop(width, height, mood, isMobile) {
  const top = lerpHex('#fcfaf5', '#fdf8f3', clamp(mood));
  const mid = mood < 1 ? lerpHex('#efe9f6', '#f7e7e9', clamp(mood)) : lerpHex('#f7e7e9', '#f6e8dc', clamp(mood - 1));
  const low = mood < 1 ? lerpHex('#f1e9dc', '#f3e4d8', clamp(mood)) : lerpHex('#f3e4d8', '#f0dfc9', clamp(mood - 1));
  const glowA = mood < 1 ? lerpHex('#ddd1f0', '#f2cfd8', clamp(mood)) : lerpHex('#f2cfd8', '#f4d9b8', clamp(mood - 1));
  const glowB = mood < 1 ? lerpHex('#cab8e8', '#eebbc9', clamp(mood)) : lerpHex('#eebbc9', '#eec9a8', clamp(mood - 1));
  const gx = isMobile ? 0.5 : 0.58;
  return `
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${top}"/>
        <stop offset="0.52" stop-color="${mid}"/>
        <stop offset="1" stop-color="${low}"/>
      </linearGradient>
      <radialGradient id="halo" cx="${gx}" cy="0.44" r="0.62">
        <stop offset="0" stop-color="${glowA}" stop-opacity="0.85"/>
        <stop offset="0.55" stop-color="${glowA}" stop-opacity="0.32"/>
        <stop offset="1" stop-color="${glowA}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="floor" cx="0.5" cy="1.02" r="0.7">
        <stop offset="0" stop-color="${glowB}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${glowB}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.46" r="1">
        <stop offset="0.7" stop-color="#2a1d2c" stop-opacity="0"/>
        <stop offset="1" stop-color="#2a1d2c" stop-opacity="0.07"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)"/>
    <rect width="100%" height="100%" fill="url(#halo)"/>
    <rect width="100%" height="100%" fill="url(#floor)"/>
    <rect width="100%" height="100%" fill="url(#vig)"/>`;
}

// --- pouring salt & botanicals --------------------------------------------
// Deterministic stream: crystals and buds spill from the jar mouth and fall
// in soft arcs past the bottom of the frame.
const GRAINS = [];
for (let i = 0; i < 64; i += 1) {
  const s1 = ((i * 73) % 97) / 97;
  const s2 = ((i * 151) % 89) / 89;
  const s3 = ((i * 37) % 53) / 53;
  GRAINS.push({
    side: i % 2 === 0 ? 1 : -1,
    offset: s1, // phase along the fall
    spread: 0.25 + s2 * 0.75, // lateral reach
    size: 2 + s3 * 5,
    bud: s2 > 0.72,
    spin: Math.round(s1 * 360),
  });
}

function pourStream(width, height, p, jar, isMobile) {
  // stream strength: ramps in while the jar grows, eases away for the finale
  const strength =
    ease(span(p, 0.08, 0.3)) * (1 - ease(span(p, ACT.finalStart - 0.06, ACT.finalStart + 0.08)));
  if (strength <= 0.02) return '';
  const colorMix = ease(span(p, ACT.wipeStart, ACT.wipeEnd));
  const mouthY = jar.top + jar.height * 0.03;
  const count = isMobile ? 38 : 64;
  const fall = height - mouthY;
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    const g = GRAINS[i];
    // each grain loops down the arc; progress drives the loop so scrubbing
    // back replays it deterministically
    const t = (g.offset + p * (1.6 + g.spread)) % 1;
    const x = width / 2 + g.side * (jar.width * 0.18 + Math.pow(t, 0.65) * jar.width * g.spread * 0.85);
    const y = mouthY + Math.pow(t, 1.7) * fall * 1.06;
    const fade = strength * (t < 0.12 ? t / 0.12 : 1 - span(t, 0.82, 1));
    if (fade < 0.05) continue;
    const size = g.size * (width / 2400) * 2.4;
    const crystal = colorMix < 0.5 ? '#efe8fb' : '#fbe3ea';
    const accent = colorMix < 0.5 ? '#b9a3df' : '#e8a2b4';
    const rot = g.spin + Math.round(t * 540);
    if (g.bud) {
      parts.push(
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})" opacity="${(fade * 0.85).toFixed(2)}"><ellipse rx="${(size * 1.5).toFixed(1)}" ry="${(size * 0.8).toFixed(1)}" fill="${accent}"/></g>`
      );
    } else {
      parts.push(
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})" opacity="${(fade * 0.9).toFixed(2)}"><rect x="${(-size / 2).toFixed(1)}" y="${(-size / 2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="${(size * 0.28).toFixed(1)}" fill="${crystal}" stroke="${accent}" stroke-opacity="0.35" stroke-width="${(size * 0.12).toFixed(1)}"/></g>`
      );
    }
  }
  return parts.join('');
}

async function jarLayer(cut, height, jarHeight) {
  const buf = await sharp(cut).resize({ height: jarHeight, kernel: 'lanczos3' }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: jarHeight };
}

function shadowSvg(width, height, cx, cy, rx, opacity) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.12}" fill="#473352" opacity="${opacity}" filter="blur(12px)"/></svg>`
  );
}

async function renderScene(width, height, mood, cut, jarHeight, jarCenterY, isMobile) {
  const jar = await jarLayer(cut, height, jarHeight);
  const top = Math.round(jarCenterY - jarHeight / 2);
  const left = Math.round((width - jar.width) / 2);
  const scene = await sharp({ create: { width, height, channels: 3, background: '#fbf8f2' } })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${backdrop(width, height, mood, isMobile)}</svg>`
        ),
      },
      { input: shadowSvg(width, height, width / 2, top + jarHeight * 1.012, jar.width * 0.46, 0.2) },
      { input: jar.buf, left, top },
    ])
    .png()
    .toBuffer();
  return { scene, jar: { top, width: jar.width, height: jarHeight } };
}

function verticalWipe(width, height, t) {
  // soft band sweeping top -> bottom, like the scene pouring into the next
  const band = 0.2;
  const pos = mix(-band, 1 + band, easeInOut(t));
  const a = clamp(pos - band);
  const b = clamp(pos + band, 0.001);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="${Math.min(a, b - 0.001)}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="${b}" stop-color="#fff" stop-opacity="0"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#w)"/>
  </svg>`;
}

function radialMask(width, height, t) {
  const r = ease(t) * 1.35;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="m" cx="0.5" cy="0.5" r="${Math.max(r, 0.001)}">
      <stop offset="0.78" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#m)"/>
  </svg>`;
}

async function maskScene(sceneBuf, maskSvg) {
  return sharp(sceneBuf)
    .ensureAlpha()
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function renderFrame(config, index) {
  const { width, height, frames, kind, quality } = config;
  const isMobile = kind === 'mobile';
  const p = index / (frames - 1);

  const grow = ease(span(p, 0, ACT.growEnd));
  const wipe = span(p, ACT.wipeStart, ACT.wipeEnd);
  const final = span(p, ACT.finalStart, ACT.finalEnd);

  const jarHeight = Math.round(height * mix(isMobile ? 0.42 : 0.5, isMobile ? 0.74 : 0.85, grow));
  const jarCenterY = height * mix(0.54, 0.49, grow);
  const layers = [];
  let jarBox = null;

  // lavender scene
  if (wipe < 1) {
    const { scene, jar } = await renderScene(width, height, 0, lavenderCut, jarHeight, jarCenterY, isMobile);
    layers.push({ input: scene });
    jarBox = jar;
  }

  // rose scene wipes in at identical scale and position
  if (wipe > 0 && final < 1) {
    const { scene, jar } = await renderScene(
      width,
      height,
      span(p, ACT.wipeEnd, ACT.finalStart),
      roseCut,
      jarHeight,
      jarCenterY,
      isMobile
    );
    layers.push(wipe >= 1 ? { input: scene } : { input: await maskScene(scene, verticalWipe(width, height, wipe)) });
    if (!jarBox || wipe > 0.5) jarBox = jar;
  }

  // finale: both products together
  if (final > 0) {
    const pairHeight = Math.round(height * (isMobile ? 0.48 : 0.58));
    const pair = await jarLayer(pairCut, height, pairHeight);
    const top = Math.round(height * (isMobile ? 0.42 : 0.43) - pairHeight / 2);
    const scene = await sharp({ create: { width, height, channels: 3, background: '#fbf8f2' } })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${backdrop(width, height, 2, isMobile)}</svg>`
          ),
        },
        { input: shadowSvg(width, height, width / 2, top + pairHeight * 1.012, pair.width * 0.46, 0.2) },
        { input: pair.buf, left: Math.round((width - pair.width) / 2), top },
      ])
      .png()
      .toBuffer();
    layers.push(final >= 1 ? { input: scene } : { input: await maskScene(scene, radialMask(width, height, final)) });
  }

  // pouring stream + gentle hand-off into the ivory page below
  const bottomFade = ease(span(p, 0.94, 1));
  const stream = jarBox ? pourStream(width, height, p, jarBox, isMobile) : '';
  layers.push({
    input: Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${stream}
      <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.85" stop-color="#faf7f1" stop-opacity="0"/>
        <stop offset="1" stop-color="#faf7f1" stop-opacity="${(bottomFade * 0.95).toFixed(2)}"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#f)"/>
    </svg>`),
  });

  await sharp({ create: { width, height, channels: 3, background: '#fbf8f2' } })
    .composite(layers)
    .webp({ quality, effort: 5 })
    .toFile(path.join(output, kind, `${String(index + 1).padStart(3, '0')}.webp`));
}

for (const config of [DESKTOP, MOBILE]) {
  for (let index = 0; index < config.frames; index += 1) {
    await renderFrame(config, index);
    process.stdout.write(`\r${config.kind}: ${index + 1}/${config.frames}`);
  }
  process.stdout.write('\n');
}

const dirs = await Promise.all(
  ['desktop', 'mobile'].map(async (kind) => {
    const files = await fs.readdir(path.join(output, kind));
    let total = 0;
    for (const file of files) {
      total += (await fs.stat(path.join(output, kind, file))).size;
    }
    return `${kind}: ${files.length} frames, ${(total / 1024 / 1024).toFixed(1)} MB`;
  })
);
console.log(dirs.join(' | '));
console.log('Hero sequence complete.');
