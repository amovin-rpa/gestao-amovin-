import { useMemo } from 'react';
import { useStore } from '../store';
import { isThisWeek, isToday, parseISO } from 'date-fns';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { Calendar, Clock } from 'lucide-react';

const statusLabels: Record<string, string> = { agendado: 'Agendado', presente: 'Presente', falta: 'Falta', falta_justificada: 'Falta Just.', ausencia: 'Ausência' };
const statusColors: Record<string, string> = { agendado: 'bg-gray-100 text-gray-800', presente: 'bg-green-100 text-green-800', falta: 'bg-red-100 text-red-800', falta_justificada: 'bg-yellow-100 text-yellow-800', ausencia: 'bg-blue-100 text-blue-800' };

export default function DashboardHome() {
  const { currentUser, consultations, beneficiaries, schedule, professionals } = useStore();

  const isConsulta = currentUser?.role === 'consulta';
  const profId = currentUser?.professionalId || currentUser?.name || '';

  const thisWeekAbsences = consultations.filter(
    (c) => c.attendance === 'falta' && isThisWeek(parseISO(c.date))
  );

  // Today's schedule for the professional
  const todaySchedule = useMemo(() => {
    const items = isConsulta
      ? schedule.filter(item => item.professionalId === profId || item.professionalId === professionals.find(p => p.name === currentUser?.name)?.id)
      : schedule;
    return items.filter(item => isToday(parseISO(item.date))).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [schedule, isConsulta, profId, professionals, currentUser?.name]);

  // Consulta welcome screen
  if (isConsulta) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-200 to-white p-8 shadow-xl shadow-yellow-900/10 border border-yellow-200">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-16 w-auto object-contain mb-3" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-900">Gestão Amovin Integrado</p>
              <h1 className="mt-2 text-3xl font-black text-gray-950">Bem-vindo(a), {currentUser?.name}</h1>
              <p className="mt-2 text-gray-800">{currentUser?.specialty || 'Profissional'}</p>
            </div>
            <div className="rounded-2xl bg-gray-950 px-6 py-5 text-yellow-200 shadow-lg text-center">
              <p className="text-xs uppercase tracking-widest text-yellow-400">Hoje</p>
              <p className="mt-1 text-3xl font-bold">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
              <p className="text-sm text-yellow-100/80">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-3">
            <Calendar size={20} className="text-amber-700" />
            <h2 className="text-lg font-bold text-gray-900">Atendimentos de Hoje</h2>
            <span className="ml-auto text-sm text-gray-500">{todaySchedule.length} agendamento(s)</span>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-medium">Nenhum atendimento agendado para hoje.</p>
              <p className="text-sm mt-1">Verifique sua agenda para os próximos dias.</p>
            </div>
          ) : (
            <div className="divide-y">
              {todaySchedule.map(item => {
                const ben = beneficiaries.find(b => b.id === item.beneficiaryId);
                const st = item.status || 'agendado';
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-yellow-50/50 transition-colors">
                    <div className="h-12 w-9 shrink-0 border bg-gray-50 overflow-hidden flex items-center justify-center text-[8px] text-gray-400 rounded">
                      {ben?.photoUrl ? <img src={ben.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{ben?.fullName || 'Beneficiário'}</p>
                      <p className="text-sm text-gray-500">{item.time} - {item.type} {item.notes ? `| ${item.notes}` : ''}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[st]}`}>{statusLabels[st]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin / Recepção dashboard
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-200 to-white p-8 shadow-xl shadow-yellow-900/10 border border-yellow-200">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-20 w-auto object-contain mb-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-900">Gestão Amovin Integrado</p>
            <h1 className="mt-2 text-4xl font-black text-gray-950">Bem-vindo, {currentUser?.name}</h1>
            <p className="mt-3 max-w-2xl text-gray-800">Painel integrado para cadastro, consultas, relatórios, comunicação interna e acompanhamento da associação.</p>
          </div>
          <div className="rounded-2xl bg-gray-950 px-6 py-5 text-yellow-200 shadow-lg">
            <p className="text-xs uppercase tracking-widest text-yellow-400">Plataforma</p>
            <p className="mt-2 text-2xl font-bold">Web, Android e iOS</p>
            <p className="mt-1 text-sm text-yellow-100/80">Interface responsiva para computador e celular.</p>
          </div>
        </div>
      </section>

      <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-yellow-100">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avisos da Semana</h2>
          <div className="border border-red-200 bg-red-50 rounded-xl p-4">
            <h3 className="text-red-800 font-medium">Faltas da Semana ({thisWeekAbsences.length})</h3>
            {thisWeekAbsences.length > 0 ? (
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {thisWeekAbsences.map(c => {
                  const b = beneficiaries.find(b => b.id === c.beneficiaryId);
                  return <li key={c.id}>{b?.fullName || 'Desconhecido'} - {new Date(c.date).toLocaleDateString()}</li>;
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-red-600">Nenhuma falta registrada nesta semana.</p>
            )}
          </div>
        </div>
      </div>

      {currentUser?.role === 'admin' && (
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-yellow-100">
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-3">
            <Calendar size={20} className="text-amber-700" />
            <h2 className="text-lg font-bold text-gray-900">Agenda de Hoje</h2>
            <span className="ml-auto text-sm text-gray-500">{todaySchedule.length} agendamento(s)</span>
          </div>
          {todaySchedule.length === 0 ? <p className="p-6 text-sm text-gray-500">Nenhum agendamento para hoje.</p> : (
            <div className="divide-y">
              {todaySchedule.map(item => {
                const ben = beneficiaries.find(b => b.id === item.beneficiaryId);
                const prof = professionals.find(p => p.id === item.professionalId);
                const st = item.status || 'agendado';
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="flex-1"><p className="font-semibold text-gray-900">{item.time} - {item.type}</p><p className="text-sm text-gray-500">{ben?.fullName || 'Beneficiário'} com {prof?.name || 'Profissional'}</p></div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[st]}`}>{statusLabels[st]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
