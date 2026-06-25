import { useState, useEffect } from 'react';
import type { IPODataInput, IPOScore, IPOAnalysis } from '../types/score';
import { calculateIPOScore } from '../utils/scoreEngine';
import { getIPOScoreAndAnalysis } from '../services/scoreService';

export const useIPOScore = (ipo: IPODataInput | null) => {
  const [score, setScore] = useState<IPOScore | null>(null);
  const [analysis, setAnalysis] = useState<IPOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!ipo) return;
    setLoading(true);
    const s = calculateIPOScore(ipo);
    setScore(s);
    setLoading(false);

    setAiLoading(true);
    getIPOScoreAndAnalysis(ipo).then(res => {
      setAnalysis(res.analysis);
      setAiLoading(false);
    });
  }, [ipo?.tickerCode, ipo?.finalPrice, ipo?.ipoStatus]);

  return { score, analysis, loading, aiLoading };
};