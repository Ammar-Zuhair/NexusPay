import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 calculation for PNG chunks
function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcBuf = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcBuf), 8 + len);
  return buf;
}

function generateNexusPayPng(size) {
  const width = size;
  const height = size;
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const radius = Math.floor(size * 0.25);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      let inCorner = false;
      if (x < radius && y < radius) {
        inCorner = Math.hypot(x - radius, y - radius) > radius;
      } else if (x >= width - radius && y < radius) {
        inCorner = Math.hypot(x - (width - radius - 1), y - radius) > radius;
      } else if (x < radius && y >= height - radius) {
        inCorner = Math.hypot(x - radius, y - (height - radius - 1)) > radius;
      } else if (x >= width - radius && y >= height - radius) {
        inCorner = Math.hypot(x - (width - radius - 1), y - (height - radius - 1)) > radius;
      }

      if (inCorner) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      const isBorder = (x < 2 || x >= width - 2 || y < 2 || y >= height - 2);

      const nx = (x + 0.5) / width;
      const ny = (y + 0.5) / height;

      const stemWidth = 0.12;
      const isLeftStem = (nx >= 0.24 && nx <= 0.24 + stemWidth && ny >= 0.24 && ny <= 0.76);
      const isRightStem = (nx >= 0.76 - stemWidth && nx <= 0.76 && ny >= 0.24 && ny <= 0.76);

      const diagLineY = 0.24 + (nx - 0.24);
      const isDiag = (nx >= 0.24 && nx <= 0.76 && Math.abs(ny - diagLineY) <= stemWidth / 1.4);

      if (isLeftStem) {
        const t = (ny - 0.24) / 0.52;
        rawData[pxOffset] = Math.floor(56 * (1 - t) + 37 * t);
        rawData[pxOffset + 1] = Math.floor(189 * (1 - t) + 99 * t);
        rawData[pxOffset + 2] = Math.floor(248 * (1 - t) + 235 * t);
        rawData[pxOffset + 3] = 255;
      } else if (isDiag) {
        const t = (nx - 0.24) / 0.52;
        rawData[pxOffset] = Math.floor(56 * (1 - t) + 52 * t);
        rawData[pxOffset + 1] = Math.floor(189 * (1 - t) + 211 * t);
        rawData[pxOffset + 2] = Math.floor(248 * (1 - t) + 153 * t);
        rawData[pxOffset + 3] = 255;
      } else if (isRightStem) {
        const t = (ny - 0.24) / 0.52;
        rawData[pxOffset] = Math.floor(52 * (1 - t) + 56 * t);
        rawData[pxOffset + 1] = Math.floor(211 * (1 - t) + 189 * t);
        rawData[pxOffset + 2] = Math.floor(153 * (1 - t) + 248 * t);
        rawData[pxOffset + 3] = 255;
      } else if (isBorder) {
        const t = (nx + ny) / 2;
        rawData[pxOffset] = Math.floor(56 * (1 - t) + 52 * t);
        rawData[pxOffset + 1] = Math.floor(189 * (1 - t) + 211 * t);
        rawData[pxOffset + 2] = Math.floor(248 * (1 - t) + 153 * t);
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = 2;
        rawData[pxOffset + 1] = 6;
        rawData[pxOffset + 2] = 23;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = createPngChunk('IHDR', ihdrData);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', compressedData);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function generateIcoFromPng(pngBuffer) {
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);

  const dirEntry = Buffer.alloc(16);
  dirEntry[0] = 32;
  dirEntry[1] = 32;
  dirEntry[2] = 0;
  dirEntry[3] = 0;
  dirEntry.writeUInt16LE(1, 4);
  dirEntry.writeUInt16LE(32, 6);
  dirEntry.writeUInt32LE(pngBuffer.length, 8);
  dirEntry.writeUInt32LE(22, 12);

  return Buffer.concat([icoHeader, dirEntry, pngBuffer]);
}

const png32 = generateNexusPayPng(32);
const png16 = generateNexusPayPng(16);
const png180 = generateNexusPayPng(180);
const ico32 = generateIcoFromPng(png32);

const targets = [
  path.join(__dirname),
  path.resolve(__dirname, '../dist')
];

for (const targetDir of targets) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'favicon.ico'), ico32);
  fs.writeFileSync(path.join(targetDir, 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(targetDir, 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(targetDir, 'apple-touch-icon.png'), png180);
  console.log(`[ICON GENERATOR] Successfully wrote favicons to ${targetDir}`);
}
