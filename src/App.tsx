import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import IpoCenter from './pages/IpoCenter';
import IpoDetail from './pages/IpoDetail';
import KalkulatorHub from './pages/KalkulatorHub';
import EstimasiPenjatahan from './pages/EstimasiPenjatahan';
import KalkulatorARAARB from './pages/KalkulatorARAARB';
import KalkulatorModal from './pages/KalkulatorModal';
import KalkulatorProfit from './pages/KalkulatorProfit';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 px-4 pt-4 pb-20 lg:pb-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ipo-center" element={<IpoCenter />} />
              <Route path="/ipo-center/:id" element={<IpoDetail />} />
              <Route path="/kalkulator" element={<KalkulatorHub />} />
              <Route path="/kalkulator/penjatahan" element={<EstimasiPenjatahan />} />
              <Route path="/kalkulator/ara-arb" element={<KalkulatorARAARB />} />
              <Route path="/kalkulator/modal" element={<KalkulatorModal />} />
              <Route path="/kalkulator/profit" element={<KalkulatorProfit />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}