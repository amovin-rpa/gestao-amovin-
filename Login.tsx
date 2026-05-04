import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, Shield, Users, Stethoscope, Loader } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_ADMIN_LOGIN = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'amovin2026';

interface ProfData {
  id: string;
  name: string;
  login: string;
  password: string;
  accessRole: string;
  specialty: string;
  [key: string]: unknown;
}

export default function Login() {
  const login = useStore((state) => state.login);
  const storeProfessionals = useStore((state) => state.professionals);
  const [activeTab, setActiveTab] = useState<'admin' | 'recepcao' | 'consulta'>('admin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [allProfessionals, setAllProfessionals] = useState<ProfData[]>([]);
  const [fbLoaded, setFbLoaded] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'professionals')).then((snapshot) => {
      const items: ProfData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          login: data.login || '',
          password: data.password || '',
          accessRole: data.accessRole || 'consulta',
          specialty: data.specialty || '',
          ...data,
        });
      });
      setAllProfessionals(items);
      setFbLoaded(true);
    }).catch((err) => {
      console.error('Erro ao carregar profissionais:', err);
      // Fallback to store
      setAllProfessionals(storeProfessionals.map(p => ({
        id: p.id,
        name: p.name,
        login: p.login,
        password: p.password,
        accessRole: p.accessRole || 'consulta',
        specialty: p.specialty || '',
      })));
      setFbLoaded(true);
    });
  }, []);

  const findProfessional = (loginInput: string, passwordInput: string, role?: string) => {
    return allProfessionals.find((prof) => {
      const loginMatch = prof.login.toLowerCase() === loginInput.toLowerCase();
      const passMatch = prof.password === passwordInput;
      if (!loginMatch || !passMatch) return false;
      if (role) return prof.accessRole === role;
      return true;
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Por favor, insira seu login.');
      setLoading(false);
      return;
    }

    // ADMIN
    if (activeTab === 'admin') {
      if (!password.trim()) {
        setError('Informe a senha.');
        setLoading(false);
        return;
      }

      // Default admin
      if (name.trim().toLowerCase() === DEFAULT_ADMIN_LOGIN && password === DEFAULT_ADMIN_PASSWORD) {
        login('admin', 'Administrador Amovin');
        return;
      }

      // Professional with admin role
      const prof = findProfessional(name.trim(), password, 'admin');
      if (prof) {
        login('admin', prof.name, prof.specialty, prof.id);
        return;
      }

      setError('Login ou senha invalido.');
      setLoading(false);
      return;
    }

    // CONSULTA
    if (activeTab === 'consulta') {
      if (!password.trim()) {
        setError('Informe a senha.');
        setLoading(false);
        return;
      }

      const prof = findProfessional(name.trim(), password, 'consulta');
      if (prof) {
        login('consulta', prof.name, prof.specialty, prof.id);
        return;
      }

      setError('Login, senha ou ambiente invalido.');
      setLoading(false);
      return;
    }

    // RECEPCAO
    if (activeTab === 'recepcao') {
      if (password.trim()) {
        // Try to find professional with recepcao role
        const prof = findProfessional(name.trim(), password, 'recepcao');
        if (prof) {
          login('recepcao', prof.name, prof.specialty, prof.id);
          return;
        }

        setError('Login ou senha invalido.');
        setLoading(false);
        return;
      }

      // Free access without password
      login('recepcao', name.trim());
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src={AMOVIN_LOGO_SRC} alt="Logo Amovin" className="mx-auto h-28 w-auto object-contain" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {S.gestaoAmovin}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {S.fichaRegistro}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 py-8 px-4 shadow-2xl shadow-yellow-900/10 ring-1 ring-yellow-200 sm:rounded-2xl sm:px-10">
          
          <div className="flex justify-center space-x-4 mb-6">
            <button onClick={() => { setActiveTab('admin'); setError(''); }} className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'admin' ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}>
              <Shield size={24} />
              <span className="text-xs mt-1 font-semibold">Administrador</span>
            </button>
            <button onClick={() => { setActiveTab('recepcao'); setError(''); }} className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'recepcao' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}>
              <Users size={24} />
              <span className="text-xs mt-1 font-semibold">Recepcao</span>
            </button>
            <button onClick={() => { setActiveTab('consulta'); setError(''); }} className={`flex flex-col items-center p-3 rounded-lg ${activeTab === 'consulta' ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}>
              <Stethoscope size={24} />
              <span className="text-xs mt-1 font-semibold">Consulta</span>
            </button>
          </div>

          {!fbLoaded && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
              <Loader size={16} className="animate-spin" /> Conectando ao servidor...
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {activeTab === 'recepcao' ? 'Seu Nome ou Login' : 'Login'}
              </label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha {activeTab === 'recepcao' && <span className="text-xs font-normal text-gray-500">(opcional)</span>}
              </label>
              <div className="mt-1">
                <input id="password" type={showPassword ? 'text' : 'password'} required={activeTab !== 'recepcao'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Use o login e a senha definidos pelo administrador.</p>
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <button type="submit" disabled={loading || !fbLoaded} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-gray-950 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50">
              {loading ? 'Entrando...' : !fbLoaded ? 'Conectando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
