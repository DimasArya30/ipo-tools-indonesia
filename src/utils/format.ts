export function formatRupiah(n: number): string {
  if (!isFinite(n) || n < 0) return 'Rp0';
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '0';
  return Math.round(n).toLocaleString('id-ID');
}

export function formatDecimal(n: number, decimals: number = 2): string {
  if (!isFinite(n)) return '0';
  return n.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDana(n: number): string {
  if (!isFinite(n) || n < 0) return 'Rp0';
  if (n >= 1e12) return 'Rp' + (n / 1e12).toFixed(1).replace('.0', '') + ' T';
  if (n >= 1e9) return 'Rp' + (n / 1e9).toFixed(1).replace('.0', '') + ' M';
  if (n >= 1e6) return 'Rp' + (n / 1e6).toFixed(1).replace('.0', '') + ' Jt';
  return formatRupiah(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}