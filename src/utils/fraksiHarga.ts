export function getTickSize(harga: number): number {
  if (harga < 200) return 1;
  if (harga < 500) return 2;
  if (harga < 2000) return 5;
  if (harga < 5000) return 10;
  return 25;
}

export function applyFraksi(harga: number): number {
  if (harga <= 0) return 0;
  const tick = getTickSize(harga);
  return Math.floor(harga / tick) * tick;
}