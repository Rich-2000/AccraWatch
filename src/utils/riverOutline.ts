/**
 * Computes the *actual* extent of the waterway in the "then" photograph and
 * traces its boundary, so that boundary can be drawn — as a dashed line —
 * on top of the "now" photograph. This replaces a generic whole-frame pixel
 * diff with something purpose-built for one question: how far has the bank
 * receded, and where has settlement moved in?
 *
 * Everything here runs on-device against the real pixels of the two
 * supplied photographs. Nothing is mocked or pre-baked. The pipeline is a
 * standard remote-sensing-style approach adapted for plain RGB photos
 * (no multispectral bands to compute a true NDWI, so we approximate):
 *
 *   1. Downsample each photo onto a working grid — or, for rivers with a
 *      `changeMapFocus` crop (see river.ts), sample only that region
 *      directly from the full-resolution source photo. Some source photos
 *      are framed wide enough to include open sea or harbour alongside a
 *      narrow channel; without a focus crop the detector can lock onto
 *      whichever area is largest, which is sometimes the ocean rather than
 *      the actual waterway.
 *   2. Score every cell for "water-likeness". On the whole frame, water
 *      reads as visually *smooth* (low local texture/variance) compared
 *      with rooftops, vegetation and bare ground, so smoothness dominates
 *      the score, with a mild darkness prior and a center-of-frame prior
 *      (source photos are centered on the mapped waterway). Within a tight
 *      focus crop, though, a thin channel's smoothness signal gets diluted
 *      against adjacent flat urban surfaces (dirt roads, rooftops) that can
 *      read just as smooth at this resolution — so focus-cropped rivers
 *      instead lean on a blue-vs-red color cue, since water reads
 *      blue/grey-shifted relative to the warm tones of bare ground.
 *   3. Threshold to a binary water mask, then clean it up with a
 *      morphological opening + closing pass (erode → dilate → dilate →
 *      erode) to remove speckle noise and bridge small gaps.
 *   4. Flood-fill to find connected components and keep the largest one —
 *      the main channel/lagoon body.
 *   5. Trace its outer boundary with Moore-neighbor contour following,
 *      producing an ordered polygon.
 *   6. Simplify the polygon and normalize it to 0..1 image-space (mapping
 *      back out of the focus crop, if one was used) so it can be drawn
 *      responsively as an SVG dashed path.
 *
 * Run once on the "then" photo and once on the "now" photo, the two water
 * area fractions also give a real, computed shrinkage percentage.
 */

const WORK_WIDTH = 220;
const WATER_FRACTION_TARGET = 0.16; // adaptive threshold aims near this
const MIN_COMPONENT_FRACTION = 0.01; // ignore specks smaller than 1% of frame

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/** Box-filtered local variance of the grayscale field — our texture/smoothness signal. */
function localVariance(gray: Float32Array, w: number, h: number, radius: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let sumSq = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const v = gray[ny * w + nx];
          sum += v;
          sumSq += v * v;
          count++;
        }
      }
      const mean = sum / count;
      out[y * w + x] = sumSq / count - mean * mean;
    }
  }
  return out;
}

function erode(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let all = 1;
      for (let dy = -1; dy <= 1 && all; dy++) {
        for (let dx = -1; dx <= 1 && all; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w || !mask[ny * w + nx]) all = 0;
        }
      }
      out[y * w + x] = all;
    }
  }
  return out;
}

function dilate(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let any = 0;
      for (let dy = -1; dy <= 1 && !any; dy++) {
        for (let dx = -1; dx <= 1 && !any; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && mask[ny * w + nx]) any = 1;
        }
      }
      out[y * w + x] = any;
    }
  }
  return out;
}

function largestComponent(mask: Uint8Array, w: number, h: number): Uint8Array {
  const visited = new Uint8Array(w * h);
  let bestComponent: number[] | null = null;
  const stack: number[] = [];

  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || visited[start]) continue;
    const component: number[] = [];
    stack.length = 0;
    stack.push(start);
    visited[start] = 1;
    while (stack.length) {
      const idx = stack.pop()!;
      component.push(idx);
      const x = idx % w;
      const y = (idx / w) | 0;
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nidx = ny * w + nx;
        if (mask[nidx] && !visited[nidx]) {
          visited[nidx] = 1;
          stack.push(nidx);
        }
      }
    }
    if (!bestComponent || component.length > bestComponent.length) bestComponent = component;
  }

  const out = new Uint8Array(w * h);
  if (bestComponent && bestComponent.length >= MIN_COMPONENT_FRACTION * w * h) {
    for (const idx of bestComponent) out[idx] = 1;
  }
  return out;
}

/** Moore-neighbor boundary tracing on a binary grid, producing an ordered polygon. */
function traceContour(mask: Uint8Array, w: number, h: number): [number, number][] {
  // Find a starting boundary pixel (top-most, then left-most water pixel).
  let startIdx = -1;
  outer: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) {
        startIdx = y * w + x;
        break outer;
      }
    }
  }
  if (startIdx === -1) return [];

  const startX = startIdx % w;
  const startY = (startIdx / w) | 0;

  // 8-connected clockwise neighbor offsets starting "north".
  const dirs = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  const at = (x: number, y: number) => x >= 0 && x < w && y >= 0 && y < h && mask[y * w + x] === 1;

  const points: [number, number][] = [];
  let cx = startX;
  let cy = startY;
  let backtrackDir = 6; // came from the west

  const maxSteps = w * h * 4;
  let steps = 0;
  do {
    points.push([cx, cy]);
    let found = false;
    for (let i = 0; i < 8; i++) {
      const dirIdx = (backtrackDir + 1 + i) % 8;
      const [dx, dy] = dirs[dirIdx];
      const nx = cx + dx;
      const ny = cy + dy;
      if (at(nx, ny)) {
        cx = nx;
        cy = ny;
        backtrackDir = (dirIdx + 4) % 8; // opposite direction
        found = true;
        break;
      }
    }
    if (!found) break;
    steps++;
  } while ((cx !== startX || cy !== startY) && steps < maxSteps);

  return points;
}

/** Douglas-Peucker-ish decimation: keep every Nth point for a lighter, smoother-reading dashed path. */
function decimate(points: [number, number][], keepEvery: number): [number, number][] {
  if (points.length <= keepEvery * 3) return points;
  return points.filter((_, i) => i % keepEvery === 0);
}

interface WaterField {
  mask: Uint8Array;
  areaFraction: number;
}

function coverRect(iw: number, ih: number, w: number, h: number) {
  const imgRatio = iw / ih;
  const targetRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = iw,
    sh = ih;
  if (imgRatio > targetRatio) {
    sw = ih * targetRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetRatio;
    sy = (ih - sh) / 2;
  }
  return { sx, sy, sw, sh };
}

function computeWaterField(
  img: HTMLImageElement,
  w: number,
  h: number,
  crop?: { x: number; y: number; width: number; height: number }
): WaterField {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  if (crop) {
    // Sample the focus region straight from the full-resolution source photo
    // in one draw, rather than cropping a copy that's already been shrunk to
    // the working resolution — cropping post-shrink would throw away exactly
    // the detail a thin, winding channel needs to stay visible.
    const { sx, sy, sw, sh } = coverRect(img.width, img.height, w, h);
    ctx.drawImage(
      img,
      sx + crop.x * sw,
      sy + crop.y * sh,
      crop.width * sw,
      crop.height * sh,
      0,
      0,
      w,
      h
    );
  } else {
    drawCover(ctx, img, w, h);
  }

  const { data } = ctx.getImageData(0, 0, w, h);

  const gray = new Float32Array(w * h);
  const darkness = new Float32Array(w * h);
  const blueness = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gy = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = gy;
    darkness[p] = 1 - gy / 255;
    // Water (even turbid lagoon water) reads blue/grey-shifted relative to
    // bare ground, sand and rooftops, which run warm (red-shifted) in these
    // photos. Normalized roughly to 0..1 over a +/-25 blue-minus-red swing.
    blueness[p] = Math.max(0, Math.min(1, (b - r) / 25 / 2 + 0.5));
  }

  const variance = localVariance(gray, w, h, 2);
  let maxVar = 1;
  for (let i = 0; i < variance.length; i++) if (variance[i] > maxVar) maxVar = variance[i];

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy);

  const score = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const smoothness = 1 - Math.min(1, variance[idx] / (maxVar * 0.35));
      const dist = Math.hypot(x - cx, y - cy) / maxDist;
      const centerWeight = 1 - 0.55 * dist;
      // Focus-cropped rivers lean on color: within a tight crop around a
      // known waterway, a thin channel's low-variance signature gets
      // diluted against adjacent flat urban surfaces, so blue-vs-red
      // dominance is a far more reliable cue there than smoothness alone.
      const s = crop
        ? smoothness * 0.05 + darkness[idx] * 0.15 + blueness[idx] * 0.8
        : smoothness * 0.72 + darkness[idx] * 0.13;
      score[idx] = s * centerWeight;
    }
  }

  const sorted = Float32Array.from(score).sort();
  const thresholdIdx = Math.max(0, Math.floor(sorted.length * (1 - WATER_FRACTION_TARGET)));
  const threshold = sorted[thresholdIdx];

  let mask: Uint8Array<ArrayBufferLike> = new Uint8Array(w * h);
  for (let i = 0; i < score.length; i++) mask[i] = score[i] >= threshold ? 1 : 0;

  // Opening (remove speckle) then closing (fill small gaps).
  mask = dilate(erode(mask, w, h), w, h);
  mask = erode(dilate(mask, w, h), w, h);

  mask = largestComponent(mask, w, h);

  let waterCount = 0;
  for (let i = 0; i < mask.length; i++) waterCount += mask[i];

  return { mask, areaFraction: waterCount / (w * h) };
}

export interface RiverOutlineResult {
  /** Normalized (0..1) polygon of the "then" waterway boundary, in image space. */
  thenOutline: [number, number][];
  thenAreaFraction: number;
  nowAreaFraction: number;
  /** 0..100, how much smaller the detected water area is "now" vs "then". */
  shrinkagePct: number;
}

export async function computeRiverOutline(
  thenSrc: string,
  nowSrc: string,
  aspectRatio: number,
  focus?: { x: number; y: number; width: number; height: number }
): Promise<RiverOutlineResult> {
  const w = WORK_WIDTH;
  const h = Math.round(WORK_WIDTH / aspectRatio);

  const [thenImg, nowImg] = await Promise.all([loadImage(thenSrc), loadImage(nowSrc)]);

  const thenField = computeWaterField(thenImg, w, h, focus);
  const nowField = computeWaterField(nowImg, w, h, focus);

  const rawContour = traceContour(thenField.mask, w, h);
  const simplified = decimate(rawContour, 2);
  const thenOutline: [number, number][] = simplified.map(([x, y]) => {
    const lx = x / w;
    const ly = y / h;
    // Map crop-local (zoomed-in) coordinates back to the full photo's 0..1
    // space, since that's what the overlay draws on top of.
    return focus ? [focus.x + lx * focus.width, focus.y + ly * focus.height] : [lx, ly];
  });

  const shrinkageRaw =
    thenField.areaFraction > 0.0005
      ? ((thenField.areaFraction - nowField.areaFraction) / thenField.areaFraction) * 100
      : 0;
  const shrinkagePct = Math.max(0, Math.min(96, Math.round(shrinkageRaw)));

  return {
    thenOutline,
    thenAreaFraction: thenField.areaFraction,
    nowAreaFraction: nowField.areaFraction,
    shrinkagePct,
  };
}
