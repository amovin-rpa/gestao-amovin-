import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, LogOut, Menu, MessageCircle, X, Cloud, User, Users, FileText, Activity, Home, Briefcase, Calendar } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';
import ChatWidget from './ChatWidget';

export default function Layout() {
  const { currentUser, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const storageMb = (JSON.stringify(useStore.getState()).length / 1024 / 1024).toFixed(2);
  const maxStorage = 50;

  const navItems = {
    admin: [
      { name: 'Dashboard', icon: Home, path: '/' },
      { name: 'Agenda Geral', icon: Calendar, path: '/agenda' },
      { name: S.beneficiarios + ' (FRB)', icon: Users, path: '/beneficiarios' },
      { name: S.profissionais, icon: User, path: '/profissionais' },
      { name: S.voluntarios, icon: Briefcase, path: '/voluntarios' },
      { name: S.financeiro, icon: Activity, path: '/financeiro' },
      { name: S.relatorios, icon: FileText, path: '/relatorios' },
      { name: 'Chat', icon: MessageCircle, path: '/chat' },
    ],
    recepcao: [
      { name: 'Dashboard', icon: Home, path: '/' },
      { name: 'Agenda', icon: Calendar, path: '/agenda' },
      { name: S.beneficiarios + ' (FRB)', icon: Users, path: '/beneficiarios' },
      { name: S.profissionais, icon: User, path: '/profissionais' },
      { name: S.voluntarios, icon: Briefcase, path: '/voluntarios' },
      { name: 'Chat', icon: MessageCircle, path: '/chat' },
    ],
    consulta: [
      { name: 'Home', icon: Home, path: '/' },
      { name: S.prontuario, icon: FileText, path: '/prontuario' },
      { name: 'Minha Agenda', icon: Calendar, path: '/agenda' },
      { name: S.beneficiarios, icon: Users, path: '/pacientes' },
      { name: S.relatorios, icon: Activity, path: '/relatorios' },
      { name: 'Chat', icon: MessageCircle, path: '/chat' },
    ]
  };

  const currentNav = currentUser?.role ? navItems[currentUser.role] : [];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none" onClick={() => setSidebarOpen(false)}><X className="h-6 w-6 text-white" /></button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4"><img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-14 w-auto object-contain" /></div>
            <nav className="mt-5 px-2 space-y-1">
              {currentNav.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setSidebarOpen(false)} className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${location.pathname === item.path ? 'bg-yellow-100 text-yellow-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <item.icon className={`mr-4 flex-shrink-0 h-6 w-6 ${location.pathname === item.path ? 'text-yellow-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4"><img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-16 w-auto object-contain" /></div>
              <nav className="mt-8 flex-1 px-2 bg-white space-y-1">
                {currentNav.map((item) => (
                  <Link key={item.name} to={item.path} className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.path ? 'bg-yellow-100 text-yellow-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${location.pathname === item.path ? 'text-yellow-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4 flex-col gap-2">
              <div className="flex items-center text-xs text-gray-500"><Cloud className="h-4 w-4 mr-1 text-green-500" /> Nuvem Ativa ({storageMb}MB / {maxStorage}MB)</div>
              <button onClick={logout} className="flex-shrink-0 w-full group block text-left">
                <div className="flex items-center"><div className="inline-block h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-5 w-5 text-gray-500" /></div><div className="ml-3"><p className="text-sm font-medium text-gray-700">{currentUser?.name}</p><p className="text-xs font-medium text-gray-500">Sair</p></div></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200 flex items-center justify-between pr-4">
          <button className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
          <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-12 w-auto object-contain" />
          <button onClick={logout} className="text-gray-600"><LogOut className="h-5 w-5" /></button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="hidden lg:flex items-center justify-between bg-gradient-to-r from-yellow-50 via-white to-amber-50 border-b border-yellow-100 px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-amber-800"><ArrowLeft size={18} /> {S.voltar}</button>
              <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-14 w-auto object-contain" />
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-gray-800"><LogOut size={16} /> Sair do ambiente</button>
          </div>
          <div className="py-6"><div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8"><Outlet /></div></div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
