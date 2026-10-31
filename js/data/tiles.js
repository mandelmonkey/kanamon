// Which tile characters can be walked on.
export const WALKABLE = new Set(['.', ',', '"', ':', '_', '*', '=', 'w', 'c', 'g']);
export const isWater = (ch) => ch === '~';
