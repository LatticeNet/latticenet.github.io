import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const width = 1600;
const height = 900;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
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

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function colorAt(x, y) {
  const nx = x / (width - 1);
  const ny = y / (height - 1);
  const vignette = Math.hypot(nx - 0.62, ny - 0.46);
  const paper = [246, 248, 244];
  const warm = [226, 235, 228];
  const base = paper.map((channel, i) => mix(channel, warm[i], Math.min(0.42, vignette * 0.55)));

  const grid = (Math.abs((x % 64) - 32) < 0.45 || Math.abs((y % 64) - 32) < 0.45) ? 8 : 0;
  const coast = Math.sin(nx * 17 + Math.sin(ny * 8) * 1.6) + Math.cos(ny * 13) * 0.65;
  const contour = Math.abs(coast) < 0.035 ? -18 : 0;

  return [
    clamp(base[0] - grid + contour),
    clamp(base[1] - grid + contour),
    clamp(base[2] - grid + contour),
  ];
}

const pixels = Buffer.alloc((width * 4 + 1) * height);

for (let y = 0; y < height; y += 1) {
  const row = y * (width * 4 + 1);
  pixels[row] = 0;
  for (let x = 0; x < width; x += 1) {
    const [r, g, b] = colorAt(x, y);
    const offset = row + 1 + x * 4;
    pixels[offset] = r;
    pixels[offset + 1] = g;
    pixels[offset + 2] = b;
    pixels[offset + 3] = 255;
  }
}

const nodes = [
  [0.74, 0.28, 78],
  [0.58, 0.48, 122],
  [0.82, 0.58, 68],
  [0.48, 0.35, 62],
  [0.36, 0.62, 58],
  [0.69, 0.74, 56],
];

function drawPixel(x, y, color, alpha = 1) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const offset = y * (width * 4 + 1) + 1 + x * 4;
  pixels[offset] = clamp(mix(pixels[offset], color[0], alpha));
  pixels[offset + 1] = clamp(mix(pixels[offset + 1], color[1], alpha));
  pixels[offset + 2] = clamp(mix(pixels[offset + 2], color[2], alpha));
}

function drawLine(ax, ay, bx, by, color, alpha = 0.62) {
  const steps = Math.ceil(Math.hypot(bx - ax, by - ay));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(mix(ax, bx, t));
    const y = Math.round(mix(ay, by, t));
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        drawPixel(x + dx, y + dy, color, alpha * (dx === 0 && dy === 0 ? 1 : 0.28));
      }
    }
  }
}

function drawCircle(cx, cy, radius, color, alpha = 1) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const distance = Math.hypot(x - cx, y - cy);
      if (distance <= radius) {
        drawPixel(x, y, color, alpha * Math.max(0.15, 1 - distance / radius));
      }
    }
  }
}

function drawHex(cx, cy, radius, color) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * Math.PI / 3;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  for (let i = 0; i < points.length; i += 1) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    drawLine(ax, ay, bx, by, color, 0.9);
  }
}

const teal = [15, 118, 110];
const tealSoft = [20, 184, 166];
const graphite = [51, 65, 85];
const amber = [217, 119, 6];
const green = [22, 101, 52];

for (let i = 0; i < nodes.length; i += 1) {
  for (let j = i + 1; j < nodes.length; j += 1) {
    if ((i + j) % 2 === 0 || Math.abs(i - j) === 1) {
      drawLine(nodes[i][0] * width, nodes[i][1] * height, nodes[j][0] * width, nodes[j][1] * height, teal, 0.34);
    }
  }
}

for (const [nx, ny, radius] of nodes) {
  const cx = nx * width;
  const cy = ny * height;
  drawCircle(cx + 14, cy + 18, radius * 0.78, [180, 174, 164], 0.18);
  drawHex(cx, cy, radius, graphite);
  drawHex(cx, cy, radius - 8, [225, 220, 211]);
  drawCircle(cx, cy, Math.max(5, radius * 0.09), tealSoft, 0.92);
  drawCircle(cx + radius * 0.46, cy - radius * 0.35, 9, amber, 0.9);
}

drawHex(0.62 * width, 0.45 * height, 150, graphite);
drawHex(0.62 * width, 0.45 * height, 124, teal);
drawCircle(0.62 * width, 0.45 * height, 70, [232, 247, 244], 0.86);
drawCircle(0.62 * width, 0.45 * height, 38, teal, 0.78);
drawLine(0.606 * width, 0.448 * height, 0.617 * width, 0.466 * height, green, 0.95);
drawLine(0.617 * width, 0.466 * height, 0.644 * width, 0.424 * height, green, 0.95);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(pixels, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

mkdirSync("docs/public", { recursive: true });
writeFileSync("docs/public/hero-lattice.png", png);
