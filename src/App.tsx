import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { enableOfflineSync, setupConnectionMonitor } from './utils/firebaseSync';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import BeneficiariesList from './pages/BeneficiariesList';
import ProfessionalsList from './pages/ProfessionalsList';
import VolunteersList from './pages/VolunteersList';
import FinanceList from './pages/FinanceList';
import FinanceDashboard from './pages/FinanceDashboard';
import Reports from './pages/Reports';
import PatientsList from './pages/PatientsList';
import Chat from './pages/Chat';
import Agenda from './pages/Agenda';
import ConsultationsList from './pages/ConsultationsList';

// ✅ Indicador Visual de Status (Online/Offline)
const SyncStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-xs font-medium shadow-lg z-50 transition-all ${
      isOnline
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse'
    }`}>
      {isOnline ? '🟢 Online - Sync ativo' : '🟡 Offline - Dados em cache'}
    </div>
  );
};

function App() {
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    // ✅ Inicialização segura do Firebase Sync
    const initSync = async () => {
      try {
        await enableOfflineSync();
        setupConnectionMonitor();
        console.log('✅ Sistema de sincronização inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar sync:', error);
      }
    };
    initSync();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          currentUser ? <Layout /> : <Navigate to="/login" />
        }>
          <Route index element={<DashboardHome />} />
          <Route path="beneficiarios" element={<BeneficiariesList />} />
          <Route path="profissionais" element={<ProfessionalsList />} />
          <Route path="voluntarios" element={<VolunteersList />} />
          <Route path="financeiro" element={<FinanceDashboard />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="pacientes" element={<PatientsList />} />
          <Route path="chat" element={<Chat />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="prontuario" element={<ConsultationsList />} />
        </Route>
      </Routes>
      
      {/* Indicador flutuante de conexão */}
      <SyncStatusIndicator />
    </Router>
  );
}

export default App;
