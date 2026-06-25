import { useState } from 'react';
import Card from '../components/Card';
import { useDividendCalculator } from '../hooks/useDividendCalculator';
import type { DividendInput } from '../types/dividend';
import { formatRupiah, formatDecimal } from '../utils/format';
import { Calculator, RotateCcw } from 'lucide-react';

const initialInput: DividendInput = { ticker: '', currentPrice: 0, buyPrice: 0, lots: 0, dps: 0, totalDividend: 0, sharesOutstanding: 0, isReinvested: false };

export default function DividendCalculator() {
  const [input, setInput] = useState<DividendInput>(initialInput);
  const result = useDividendCalculator(input);

  const handleChange = (field: keyof DividendInput, value: string | boolean) => {
    if (typeof value === 'boolean') return setInput(p => ({ ...p, [field]: value }));
    const num = value === '' ? 0 : Number(value.replace(/\./g, '').replace(/,/g, ''));
    setInput(p => ({ ...p, [field]: isNaN(num) ? 0 : num }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Calculator className="w-8 h-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dividend Calculator</h1>
          <p className="text-sm text-gray-500">Hitung dividen, pajak, yield, dan proyeksi reinvestasi</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Ticker Saham</label>
            <input value={input.ticker} onChange={e => handleChange('ticker', e.target.value)} placeholder="BBCA" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Harga Saham Saat Ini (Rp)</label>
            <input type="text" inputMode="numeric" value={input.currentPrice > 0 ? input.currentPrice.toLocaleString('id-ID') : ''} onChange={e => handleChange('currentPrice', e.target.value)} placeholder="9000" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Harga Beli (Rp) - Untuk Yield on Cost</label>
            <input type="text" inputMode="numeric" value={input.buyPrice > 0 ? input.buyPrice.toLocaleString('id-ID') : ''} onChange={e => handleChange('buyPrice', e.target.value)} placeholder="7500" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Jumlah Lot</label>
            <input type="text" inputMode="numeric" value={input.lots > 0 ? input.lots.toLocaleString('id-ID') : ''} onChange={e => handleChange('lots', e.target.value)} placeholder="100" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Dividend Per Share - DPS (Rp)</label>
            <input type="text" inputMode="numeric" value={input.dps > 0 ? input.dps.toLocaleString('id-ID') : ''} onChange={e => handleChange('dps', e.target.value)} placeholder="530" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer p-2">
              <input type="checkbox" checked={input.isReinvested} onChange={e => handleChange('isReinvested', e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Reinvestasi Dividen (Pajak 0%)</span>
            </label>
          </div>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="text-center">
            <p className="text-xs text-gray-500">Total Dividen Kotor</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupiah(result.grossDividend)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500">Dividen Bersih (Setelah Pajak {result.taxRate * 100}%)</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(result.netDividend)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500">Dividend Yield</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatDecimal(result.yieldPercentage)}%</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-3">Detail Perhitungan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Jumlah Saham</span><span>{result.sharesHeld.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">DPS Digunakan</span><span>{formatRupiah(result.calculatedDPS)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pajak ({result.taxRate * 100}%)</span><span className="text-red-500">- {formatRupiah(result.taxAmount)}</span></div>
              {input.buyPrice > 0 && <div className="flex justify-between"><span className="text-gray-500">Yield on Cost</span><span className="font-medium text-emerald-600">{formatDecimal(result.yieldOnCost)}%</span></div>}
            </div>
          </Card>

          {input.isReinvested && (
            <Card className="md:col-span-2 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Simulasi Reinvestasi</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Dengan dividen bersih {formatRupiah(result.netDividend)}, Anda dapat membeli <span className="font-bold text-emerald-600">{result.reinvestLots} Lot</span> saham baru pada harga saat ini.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}