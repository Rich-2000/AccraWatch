/**
 * Computes a real, on-device change-highlight overlay from the actual pixel
 * data of the two supplied images. Nothing here is mocked or pre-baked —
 * every run reads the true pixel values of the then/now photographs.
 *
 * Because the two captures were taken at different times (and sometimes
 * slightly different framing/zoom), this is an *approximate* visual change
 * map, not a scientific land-cover classification. We say so in the UI.
 */

const WORK_WIDTH = 360;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
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

export interface DiffResult {
  /** transparent PNG data URL containing a white sketch/outline of changed regions */
  overlayDataUrl: string;
  /** 0-100, rough proportion of the frame flagged as changed */
  changedPct: number;
}

export async function computeChangeOverlay(
  thenSrc: string,
  nowSrc: string,
  aspectRatio: number
): Promise<DiffResult> {
  const width = WORK_WIDTH;
  const height = Math.round(WORK_WIDTH / aspectRatio);

  const [thenImg, nowImg] = await Promise.all([loadImage(thenSrc), loadImage(nowSrc)]);

  const a = document.createElement("canvas");
  a.width = width;
  a.height = height;
  const actx = a.getContext("2d")!;
  drawCover(actx, thenImg, width, height);

  const b = document.createElement("canvas");
  b.width = width;
  b.height = height;
  const bctx = b.getContext("2d")!;
  drawCover(bctx, nowImg, width, height);

  const aData = actx.getImageData(0, 0, width, height);
  const bData = bctx.getImageData(0, 0, width, height);

  // Grayscale absolute difference, mild blur via 3x3 box averaging to reduce
  // false positives from JPEG noise / minor registration offsets.
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < aData.data.length; i += 4, p++) {
    const ga = 0.299 * aData.data[i] + 0.587 * aData.data[i + 1] + 0.114 * aData.data[i + 2];
    const gb = 0.299 * bData.data[i] + 0.587 * bData.data[i + 1] + 0.114 * bData.data[i + 2];
    gray[p] = Math.abs(ga - gb);
  }

  const blurred = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }
      blurred[y * width + x] = sum / count;
    }
  }

  // Threshold into a binary "changed" mask.
  const threshold = 34;
  const mask = new Uint8Array(width * height);
  let changedCount = 0;
  for (let i = 0; i < blurred.length; i++) {
    if (blurred[i] > threshold) {
      mask[i] = 1;
      changedCount++;
    }
  }

  // Edge-detect the mask (simple gradient) so we draw an outline "sketch"
  // rather than a solid blob.
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const octx = out.getContext("2d")!;
  const outData = octx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;
      const left = x > 0 ? mask[idx - 1] : 1;
      const right = x < width - 1 ? mask[idx + 1] : 1;
      const up = y > 0 ? mask[idx - width] : 1;
      const down = y < height - 1 ? mask[idx + width] : 1;
      const isEdge = !left || !right || !up || !down;
      const p = idx * 4;
      if (isEdge) {
        outData.data[p] = 255;
        outData.data[p + 1] = 255;
        outData.data[p + 2] = 255;
        outData.data[p + 3] = 235;
      } else {
        outData.data[p] = 255;
        outData.data[p + 1] = 255;
        outData.data[p + 2] = 255;
        outData.data[p + 3] = 30;
      }
    }
  }

  octx.putImageData(outData, 0, 0);

  // Upscale to a larger canvas with smoothing so the sketch reads cleanly,
  // then apply a slight blur for an organic "hand-marked" edge.
  const final = document.createElement("canvas");
  final.width = width * 3;
  final.height = height * 3;
  const fctx = final.getContext("2d")!;
  fctx.filter = "blur(1.4px)";
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(out, 0, 0, final.width, final.height);

  const changedPct = Math.round((changedCount / (width * height)) * 100);

  return {
    overlayDataUrl: final.toDataURL("image/png"),
    changedPct,
  };
}
