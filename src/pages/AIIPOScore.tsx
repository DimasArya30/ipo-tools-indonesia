import { useState } from 'react';
import Card from '../components/Card';
import { useIPOScore } from '../hooks/useIPOScore';
import { getAllIPO } from '../services/ipoService';
import type { IPODataInput } from '../types/score';
import type { IpoData } from '../types'; // IpoData from your existing types
import { Brain, Loader2, AlertTriangle } from 'lucide-react';

export default function AIIPOScore() {
  const [ticker, setTicker] = useState('');
  const [ipo, setIpo] = useState<IPODataInput | null>(null);
  const [searching, setSearching] = useState(false);
  const { score, analysis, loading, aiLoading } = useIPOScore(ipo);

  const handleSearch = async () => {
    if (!ticker) return;
    setSearching(true);
    const allIpo = await getAllIPO();
    const found = allIpo.find((i: IpoData) => i.tickerCode.toLowerCase() === ticker.toLowerCase());
    if (found) {
      setIpo({
        tickerCode: found.tickerCode, companyName: found.companyName, ipoStatus: found.ipoStatus,
        sector: found.sector, subsector: found.subsector, listingBoard: found.listingBoard,
        finalPrice: found.finalPrice, sharesOffered: found.sharesOffered, offeringPercentage: found.offeringPercentage,
        underwriters: found.underwriters, bookBuildingOpening: found.bookBuildingOpening, bookBuildingClosing: found.bookBuildingClosing,
        offeringOpening: found.offeringOpening, offeringClosing: found.offeringClosing, closingDate: found.closingDate,
        distributionDate: found.distributionDate, listingDate: found.listingDate, website: found.website,
        lineOfBusiness: found.lineOfBusiness, returnD1: found.returnD1, returnD7: found.returnD7, returnFromListing: found.returnFromListing,
      });
    } else {
      setIpo(null);
    }
    setSearching(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI IPO Score</h1>
          <p className="text-sm text-gray-500">Analisis kualitas IPO berbasis Formula Engine & AI</p>
        </div>
      </div>

      <Card>
        <div className="flex gap-2">
          <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="Masukkan Ticker (contoh: GOTO)" className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch} disabled={searching} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-50">{searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analisis'}</button>
        </div>
      </Card>

      {ipo && score && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="text-center space-y-4">
            <h2 className="font-bold text-lg">{ipo.tickerCode} - {ipo.companyName}</h2>
            <div className="text-5xl font-extrabold text-emerald-500">{score.score}</div>
            <div className="text-xl font-semibold">{score.rating}</div>
            <div className="flex justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full">Risk: {score.risk}</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-full">Confidence: {score.confidence}</span>
            </div>
          </Card>
          
          <Card>
            <h3 className="font-semibold mb-3">Skor Komponen</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} className="flex justify-between"><span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span><span className="font-medium">{val}/15</span></div>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Analisis AI (Gemini)</h3>
              {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            {analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><h4 className="font-medium text-emerald-500 mb-1">Kelebihan</h4><p className="text-gray-600 dark:text-gray-300">{analysis.strength}</p></div>
                <div><h4 className="font-medium text-red-500 mb-1">Risiko</h4><p className="text-gray-600 dark:text-gray-300">{analysis.weakness}</p></div>
                <div><h4 className="font-medium text-blue-500 mb-1">Potensi Jangka Pendek</h4><p className="text-gray-600 dark:text-gray-300">{analysis.shortTermPotential}</p></div>
                <div><h4 className="font-medium text-indigo-500 mb-1">Potensi Jangka Panjang</h4><p className="text-gray-600 dark:text-gray-300">{analysis.longTermPotential}</p></div>
                <div className="md:col-span-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><h4 className="font-medium mb-1">Kesimpulan</h4><p className="text-gray-600 dark:text-gray-300">{analysis.conclusion}</p></div>
              </div>
            ) : (
              !aiLoading && <div className="flex items-center gap-2 text-sm text-gray-400"><AlertTriangle className="w-4 h-4" /> Gagal memuat analisis AI atau API Key belum diset.</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}