import type { Map as MapLibre } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';

const SIZE = 22;

const draw = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  ctx.moveTo(SIZE / 2, 1);
  ctx.lineTo(SIZE - 4, SIZE - 3);
  ctx.lineTo(SIZE / 2, SIZE - 8);
  ctx.lineTo(4, SIZE - 3);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(16, 22, 31, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
};

/** Register the direction-arrow sprite (style swaps clear images). */
export const addArrowImage = (map: MapLibre): void => {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  [ctx]
    .filter((c): c is CanvasRenderingContext2D => c !== null)
    .forEach((c) => {
      draw(c);
      const image = c.getImageData(0, 0, SIZE, SIZE);
      branch(map.hasImage('vehicle-arrow'))(
        () => undefined,
        () => {
          map.addImage('vehicle-arrow', image);
        },
      );
    });
};
