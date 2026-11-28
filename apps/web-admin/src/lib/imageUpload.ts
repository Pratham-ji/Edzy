const MAX_IMAGE_DIMENSION = 360;
const TARGET_MAX_CHARS = 108_000; // ~80KB encoded image budget
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

export interface ProcessedUploadImage {
  dataUrl: string;
  byteSize: number;
  width: number;
  height: number;
}

/** Validates, downscales, and compresses PNG/JPG/WebP assets client-side while preserving transparency. */
export async function processBrandImageUpload(file: File): Promise<ProcessedUploadImage> {
  if (!ALLOWED_MIME_TYPES.has((file.type || '').toLowerCase())) {
    throw new Error('Please upload a PNG, JPG, or WebP image file.');
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Image file is too large (max 6 MB before compression).');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode the selected image.'));
      el.src = objectUrl;
    });

    const preserveAlpha = file.type === 'image/png' || file.type === 'image/webp';
    const mimePrimary = preserveAlpha ? 'image/png' : 'image/jpeg';

    const encodeAtScale = (maxDim: number, mime: string, quality?: number) => {
      const ratio = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
      const w = Math.max(1, Math.round((img.width || maxDim) * ratio));
      const h = Math.max(1, Math.round((img.height || maxDim) * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');
      if (!preserveAlpha || mime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      return {
        dataUrl: canvas.toDataURL(mime, quality),
        width: w,
        height: h,
      };
    };

    let result = encodeAtScale(MAX_IMAGE_DIMENSION, mimePrimary, preserveAlpha ? undefined : 0.88);
    if (result.dataUrl.length > TARGET_MAX_CHARS && preserveAlpha) {
      result = encodeAtScale(260, 'image/webp', 0.86);
    }
    if (result.dataUrl.length > TARGET_MAX_CHARS) {
      result = encodeAtScale(240, 'image/jpeg', 0.78);
    }

    const byteSize = Math.round((result.dataUrl.length * 3) / 4);
    return { ...result, byteSize };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
