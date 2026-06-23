export function formatRupiah(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID');
}

export function formatDecimal(n: number, decimals: number = 2): string {
  return n.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}