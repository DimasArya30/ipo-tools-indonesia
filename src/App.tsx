import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EstimasiPenjatahan from './pages/EstimasiPenjatahan';
import KalkulatorARAARB from './pages/KalkulatorARAARB';
import KalkulatorModal from './pages/KalkulatorModal';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/penjatahan" element={<EstimasiPenjatahan />} />
            <Route path="/ara-arb" element={<KalkulatorARAARB />} />
            <Route path="/modal" element={<KalkulatorModal />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}