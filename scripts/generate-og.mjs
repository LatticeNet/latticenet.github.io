// Generates docs/public/og-image.png — a 1200x630 branded social card drawn at
// exact pixels (crisp, no external font/raster deps). The wordmark is carried by
// og:title/og:description; the card is the visual brand: dark cool-slate field,
// a teal lattice mesh, a glowing focal hub, and the LatticeNet logo mark.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const mix = (a, b, t) => a + (b - a) * t;

// Palette (cool slate + teal), aligned with the product identity.
const C = {
  bgTop: [17, 23, 32],
  bgBot: [9, 12, 18],
  glow: [13, 90, 80],
  line: [45, 212, 191],
  node: [120, 138, 156],
  accent: [45, 212, 191],
  hot: [94, 234, 212],
  ink: [233, 238, 245],
};

const pixels = Buffer.alloc((W * 4 + 1) * H);

// Base gradient + teal radial glow.
for (let y = 0; y < H; y += 1) {
  const row = y * (W * 4 + 1);
  pixels[row] = 0;
  for (let x = 0; x < W; x += 1) {
    const tDiag = (x / W + y / H) / 2;
    let r = mix(C.bgTop[0], C.bgBot[0], tDiag);
    let g = mix(C.bgTop[1], C.bgBot[1], tDiag);
    let b = mix(C.bgTop[2], C.bgBot[2], tDiag);
    const gd = Math.hypot((x - 840) / W, (y - 250) / H);
    const glow = Math.max(0, 1 - gd * 2.4) ** 2 * 0.55;
    r = mix(r, C.glow[0], glow);
    g = mix(g, C.glow[1], glow);
    b = mix(b, C.glow[2], glow);
    const off = row + 1 + x * 4;
    pixels[off] = clamp(r);
    pixels[off + 1] = clamp(g);
    pixels[off + 2] = clamp(b);
    pixels[off + 3] = 255;
  }
}

function blend(x, y, color, alpha) {
  if (x < 0 || x >= W || y < 0 || y >= H || alpha <= 0) return;
  const off = y * (W * 4 + 1) + 1 + x * 4;
  pixels[off] = clamp(mix(pixels[off], color[0], alpha));
  pixels[off + 1] = clamp(mix(pixels[off + 1], color[1], alpha));
  pixels[off + 2] = clamp(mix(pixels[off + 2], color[2], alpha));
}

function line(ax, ay, bx, by, color, alpha) {
  const steps = Math.ceil(Math.hypot(bx - ax, by - ay));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(mix(ax, bx, t));
    const y = Math.round(mix(ay, by, t));
    blend(x, y, color, alpha);
    blend(x + 1, y, color, alpha * 0.35);
    blend(x, y + 1, color, alpha * 0.35);
  }
}

function disc(cx, cy, radius, color, alpha) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius) blend(x, y, color, alpha * Math.max(0.12, 1 - d / radius));
    }
  }
}

function ring(cx, cy, radius, color, alpha) {
  for (let a = 0; a < Math.PI * 2; a += 0.012) {
    blend(Math.round(cx + Math.cos(a) * radius), Math.round(cy + Math.sin(a) * radius), color, alpha);
  }
}

// Lattice mesh — a deterministic node field, denser/brighter toward the glow.
const mesh = [];
for (let r = 0; r < 5; r += 1) {
  for (let c = 0; c < 7; c += 1) {
    const jx = Math.sin((r * 3.1 + c * 1.7) * 1.3) * 26;
    const jy = Math.cos((c * 2.2 + r * 1.1) * 1.15) * 22;
    mesh.push({ r, c, x: 470 + c * 120 + jx, y: 90 + r * 115 + jy });
  }
}
const meshAt = (r, c) => mesh.find((n) => n.r === r && n.c === c);
for (const n of mesh) {
  for (const m of [meshAt(n.r, n.c + 1), meshAt(n.r + 1, n.c)]) {
    if (m) line(n.x, n.y, m.x, m.y, C.line, 0.16);
  }
}
for (const n of mesh) disc(n.x, n.y, 3.2, C.node, 0.7);

// Focal hub.
ring(840, 250, 86, C.accent, 0.5);
ring(840, 250, 58, C.accent, 0.7);
disc(840, 250, 30, C.hot, 0.85);
disc(840, 250, 12, C.ink, 0.95);

// LatticeNet logo mark — an elevated rounded tile, teal-bordered, with the
// lattice grid + nodes. A soft glow behind lifts it off the slate field.
const ox = 116;
const oy = 178;
const s = 256;
const corner = 40;
disc(ox + s / 2, oy + s / 2, s * 0.66, C.glow, 0.26);
for (let y = 0; y < s; y += 1) {
  for (let x = 0; x < s; x += 1) {
    const dx = Math.min(x, s - 1 - x);
    const dy = Math.min(y, s - 1 - y);
    const edge = dx < corner && dy < corner
      ? corner - Math.hypot(corner - dx, corner - dy)
      : Math.min(dx, dy);
    if (edge < 0) continue;
    blend(ox + x, oy + y, [24, 31, 44], 0.97);
    if (edge < 2.6) blend(ox + x, oy + y, C.accent, 0.55 * (1 - edge / 2.6));
    if (y < s * 0.5) blend(ox + x, oy + y, [255, 255, 255], 0.016 * (1 - y / (s * 0.5)));
  }
}
const g0 = ox + s * 0.24;
const g1 = ox + s * 0.5;
const g2 = ox + s * 0.76;
const h0 = oy + s * 0.24;
const h1 = oy + s * 0.5;
const h2 = oy + s * 0.76;
for (const gy of [h0, h1, h2]) line(ox + s * 0.2, gy, ox + s * 0.8, gy, C.line, 0.9);
for (const gx of [g0, g1, g2]) line(gx, oy + s * 0.2, gx, oy + s * 0.8, C.line, 0.9);
for (const [px, py] of [[g0, h0], [g2, h0], [g0, h2], [g2, h2]]) disc(px, py, 7, C.ink, 0.98);
disc(g1, h1, 13, C.accent, 0.3);
disc(g1, h1, 9, C.hot, 0.98);

// Teal accent underline beneath the mark.
line(ox, oy + s + 34, ox + 230, oy + s + 34, C.accent, 0.9);
disc(ox, oy + s + 34, 3, C.accent, 1);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(pixels, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

mkdirSync("docs/public", { recursive: true });
writeFileSync("docs/public/og-image.png", png);
