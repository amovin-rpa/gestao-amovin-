import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import BeneficiariesList from './pages/BeneficiariesList';
import ProfessionalsList from './pages/ProfessionalsList';
import VolunteersList from './pages/VolunteersList';
import FinanceList from './pages/FinanceList';
import Reports from './pages/Reports';
import PatientsList from './pages/PatientsList';
import Chat from './pages/Chat';
import Agenda from './pages/Agenda';
import ConsultationsList from './pages/ConsultationsList';

function App() {
  const currentUser = useStore((state) => state.currentUser);

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
          <Route path="financeiro" element={<FinanceList />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="pacientes" element={<PatientsList />} />
          <Route path="chat" element={<Chat />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="prontuario" element={<ConsultationsList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;