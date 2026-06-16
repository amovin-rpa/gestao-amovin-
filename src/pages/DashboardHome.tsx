import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { isThisWeek, isToday, parseISO, getDaysInMonth } from 'date-fns';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { Calendar, Clock, Upload, AlertCircle } from 'lucide-react';

// ✅ CORREÇÃO: Caminho atualizado para a pasta utils
import { uploadAllToFirebase } from '../utils/firebaseSync';
import { Link } from 'react-router-dom';

const statusLabels: Record<string, string> = {
  agendado: 'Agendado',
  presente: 'Presente',
  falta: 'Falta',
  falta_justificada: 'Falta Justificada',
  ausencia: 'Ausência',
  cancelamento: 'Cancelado',
};

const statusColors: Record<string, string> = {
  agendado: 'bg-gray-100 text-gray-800',
  presente: 'bg-green-100 text-green-800',
  falta: 'bg-red-200 text-red-900 font-bold',
  falta_justificada: 'bg-yellow-100 text-yellow-800',
  ausencia: 'bg-blue-100 text-blue-800',
  cancelamento: 'bg-purple-100 text-purple-800',
};

const statusBarColors: Record<string, string> = {
  agendado: 'bg-blue-500',
  presente: 'bg-green-600',
  falta: 'bg-red-600',
  falta_justificada: 'bg-yellow-500',
  ausencia: 'bg-blue-700',
  cancelamento: 'bg-purple-600',
};

const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const monthNames = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

export default function DashboardHome() {
  const { currentUser, consultations, beneficiaries, schedule, professionals } = useStore();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [calendarViewMonth, setCalendarViewMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const monthCalendarDays = useMemo(() => {
    const [y, m] = calendarViewMonth.split('-').map(Number);
    const total = getDaysInMonth(new Date(y, m - 1));
    const firstDay = new Date(y, m - 1, 1).getDay();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [calendarViewMonth]);

  const allAppointments = useMemo(() => {
    return [...schedule].sort((a, b) =>
      `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`)
    );
  }, [schedule]);

  const monthAppointments = useMemo(() => {
    return allAppointments.filter(item => item.date?.startsWith(calendarViewMonth));
  }, [allAppointments, calendarViewMonth]);

  const todaySchedule = useMemo(() => {
    return allAppointments
      .filter(item => item.date && isToday(parseISO(item.date)))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [allAppointments]);

  const thisWeekAbsences = consultations.filter(
    (c) => c.attendance === 'falta' && isThisWeek(parseISO(c.date))
  );

  const monthFaltas = monthAppointments.filter(a => a.status === 'falta').length;
  const monthPresencas = monthAppointments.filter(a => a.status === 'presente').length;
  const monthCancelados = monthAppointments.filter(a => a.status === 'cancelamento').length;

  const changeCalendarMonth = (delta: number) => {
    const [y, m] = calendarViewMonth.split('-').map(Number);
    const next = new Date(y, m - 1 + delta, 1);
    setCalendarViewMonth(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
    );
  };

  return (
    <div className="space-y-6">

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-200 to-white p-8 shadow-xl shadow-yellow-900/10 border border-yellow-200">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-16 w-auto object-contain mb-3" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-900">
              Gestão Amovin Integrado
            </p>
            <h1 className="mt-2 text-3xl font-black text-gray-950">
              Bem-vindo(a), {currentUser?.name}
            </h1>
            <p className="mt-2 text-gray-800">
              {currentUser?.specialty || 'Painel geral AMOVIN'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-950 px-6 py-5 text-yellow-200 shadow-lg text-center">
            <p className="text-xs uppercase tracking-widest text-yellow-400">Hoje</p>
            <p className="mt-1 text-3xl font-bold capitalize">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
            </p>
            <p className="text-sm text-yellow-100/80">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100">
          <p className="text-xs text-gray-500">Total no mês</p>
          <p className="text-2xl font-bold text-gray-700">{monthAppointments.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100">
          <p className="text-xs text-green-700">Presenças</p>
          <p className="text-2xl font-bold text-green-700">{monthPresencas}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-200">
          <p className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle size={14}/> Faltas
          </p>
          <p className="text-2xl font-bold text-red-700">{monthFaltas}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl shadow-sm border border-purple-200">
          <p className="text-xs text-purple-700">Cancelamentos</p>
          <p className="text-2xl font-bold text-purple-700">{monthCancelados}</p>
        </div>
      </div>

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
            <p className="text-sm mt-1">Verifique o calendário mensal abaixo.</p>
          </div>
        ) : (
          <div className="divide-y">
            {todaySchedule.map(item => {
              const ben = beneficiaries.find(b => b.id === item.beneficiaryId);
              const prof = professionals.find(p => p.id === item.professionalId);
              const st = item.status || 'agendado';
              return (
                <Link to="/agenda" key={item.id} className={`flex items-center gap-4 p-4 hover:bg-yellow-50/50 transition-colors ${st === 'falta' ? 'bg-red-50' : ''}`}>
                  <div className="h-12 w-9 shrink-0 border bg-gray-50 overflow-hidden flex items-center justify-center text-[8px] text-gray-400 rounded">
                    {ben?.photoUrl ? <img src={ben.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ben?.fullName || 'Beneficiário'}</p>
                    <p className="text-sm text-gray-500">{item.time} - {item.type} | {prof?.name || 'Profissional'} {item.notes ? `| ${item.notes}` : ''}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[st]}`}>{statusLabels[st]}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={20}/> Agenda Geral do Mês
            <span className="text-xs font-normal text-gray-500 ml-2">todos os profissionais</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => changeCalendarMonth(-1)} className="px-3 py-1 border rounded hover:bg-gray-50">◀</button>
            <span className="text-sm font-semibold w-40 text-center capitalize">
              {monthNames[parseInt(calendarViewMonth.split('-')[1]) - 1]} {calendarViewMonth.split('-')[0]}
            </span>
            <button onClick={() => changeCalendarMonth(1)} className="px-3 py-1 border rounded hover:bg-gray-50">▶</button>
          </div>
        </div>

        <div className="mb-3 text-sm text-gray-600">
          Total exibido: <strong>{monthAppointments.length}</strong> agendamento(s)
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-2">
          {weekDays.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthCalendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="min-h-[130px]" />;
            const [y, m] = calendarViewMonth.split('-').map(Number);
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAppointments = monthAppointments.filter(a => a.date === dateStr);
            const isTodayDay = dateStr === todayStr;

            return (
              <div key={idx} className={`min-h-[130px] border rounded-md p-1 text-left overflow-y-auto ${isTodayDay ? 'bg-yellow-50 border-yellow-400' : 'bg-white'}`}>
                <div className={`text-xs font-bold mb-1 ${isTodayDay ? 'text-yellow-700' : 'text-gray-600'}`}>{day}</div>
                <div className="space-y-1">
                  {dayAppointments.map((a) => {
                    const ben = beneficiaries.find(b => b.id === a.beneficiaryId);
                    const prof = professionals.find(p => p.id === a.professionalId);
                    const st = a.status || 'agendado';
                    return (
                      <Link to="/agenda" key={a.id} className={`block text-[10px] leading-tight px-1 py-1 rounded text-white ${statusBarColors[st]} hover:opacity-90`} title={`${a.time} - ${ben?.fullName || ''} - ${prof?.name || ''} - ${statusLabels[st]}`}>
                        <div className="font-bold truncate">{a.time} {ben?.fullName?.split(' ')[0] || 'Beneficiário'}</div>
                        <div className="truncate opacity-90">{prof?.name?.split(' ')[0] || 'Prof.'}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Agendado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600 inline-block"></span> Presente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block"></span> Falta</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span> Falta Justificada</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600 inline-block"></span> Cancelado</span>
        </div>
      </div>

      {currentUser?.role !== 'consulta' && (
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
      )}

      {currentUser?.role === 'admin' && <SyncToFirebaseButton />}
    </div>
  );
}

function SyncToFirebaseButton() {
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);
  const store = useStore.getState();

  const handleSync = async () => {
    if (!window.confirm('Enviar todos os dados locais para a nuvem Firebase?\n\nIsso vai copiar todos os cadastros para a nuvem do Google.')) return;
    setSyncing(true);
    try {
      const total = await uploadAllToFirebase(store as unknown as Record<string, unknown>);
      setDone(true);
      alert(`Sincronizacao concluida! ${total} registro(s) enviados para a nuvem.`);
    } catch (err) {
      console.error(err);
      alert('Erro ao sincronizar. Verifique a conexao com a internet.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-blue-100">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Upload size={18} className="text-blue-600" /> Sincronizar com Firebase</h3>
          <p className="text-sm text-gray-500 mt-1">{done ? 'Dados sincronizados com sucesso!' : 'Envie os dados locais para a nuvem do Google.'}</p>
        </div>
        {!done && (
          <button onClick={handleSync} disabled={syncing} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
            {syncing ? 'Enviando...' : 'Sincronizar Agora'}
          </button>
        )}
        {done && <span className="text-green-600 font-semibold text-sm">OK</span>}
      </div>
    </div>
  );
}
