export * from './types';

/**
 * Standard utility to normalize arbitrary screen dimensions to a canonical 16:9 spatial frustum
 */
export function normalizeViewportCoordinates(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number
): { normX: number; normY: number } {
  const currentRatio = screenWidth / screenHeight;
  const targetRatio = 16 / 9;

  let normX = (x / screenWidth) * 2 - 1;
  let normY = (y / screenHeight) * 2 - 1;

  if (currentRatio > targetRatio) {
    normX = normX * (currentRatio / targetRatio);
  } else {
    normY = normY * (targetRatio / currentRatio);
  }

  return { normX, normY };
}
