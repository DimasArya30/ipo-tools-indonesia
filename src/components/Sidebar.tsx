import { LayoutDashboard, Calculator, TrendingUp, Wallet, Database, Brain, Newspaper, Calculator as DivCalc } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/penjatahan', icon: Calculator, label: 'Estimasi Penjatahan' },
  { to: '/ara-arb', icon: TrendingUp, label: 'Kalkulator ARA & ARB' },
  { to: '/modal', icon: Wallet, label: 'Kalkulator Modal' },
  { to: '/ipo-center', icon: Database, label: 'IPO Center' },
  { to: '/ai-ipo-score', icon: Brain, label: 'AI IPO Score' },
  { to: '/news-center', icon: Newspaper, label: 'News Center' },
  { to: '/dividend-calculator', icon: DivCalc, label: 'Dividend Calc' },
];