import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Users, Briefcase, HeartHandshake, CalendarCheck, Calendar } from 'lucide-react';
import { getDaysInMonth } from 'date-fns';
import { Link } from 'react-router-dom';

const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const statusLabels: Record<string, string> = {
  agendado: 'Agendado',
  presente: 'Presente',
  falta: 'Falta',
  falta_justificada: 'Falta Justificada',
  cancelamento: 'Cancelado',
};

const statusBarColors: Record<string, string> = {
  agendado: 'bg-blue-400',
  presente: 'bg-green-500',
  falta: 'bg-red-600',
  falta_justificada: 'bg-yellow-500',
  cancelamento: 'bg-purple-500',
};

export default function DashboardHome() {
  const { currentUser, beneficiaries, professionals, volunteers, schedule } = useStore();

  const now = new Date();
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

  const monthAppointments = useMemo(() => {
    return schedule.filter(item => item.date.startsWith(calendarViewMonth));
  }, [schedule, calendarViewMonth]);

  const changeCalendarMonth = (delta: number) => {
    const [y, m] = calendarViewMonth.split('-').map(Number);
    const next = new Date(y, m - 1 + delta, 1);
    setCalendarViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const todayStr = now.toISOString().split('T')[0];
  const todayCount = schedule.filter(s => s.date === todayStr).length;

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Olá, {currentUser?.name || 'Usuário'} 👋
        </h1>
        <p className="text-sm text-gray-500">Visão geral do sistema AMOVIN</p>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/beneficiarios" className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Users className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Beneficiários</p>
              <p className="text-2xl font-bold">{beneficiaries.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/profissionais" className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Briefcase className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Profissionais</p>
              <p className="text-2xl font-bold">{professionals.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/voluntarios" className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-3 rounded-xl">
              <HeartHandshake className="text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Voluntários</p>
              <p className="text-2xl font-bold">{volunteers.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/agenda" className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <CalendarCheck className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Agendamentos hoje</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* CALENDÁRIO MENSAL VISUAL - TODOS OS PROFISSIONAIS */}
      <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={20}/> Agenda Geral do Mês
            <span className="text-xs font-normal text-gray-500 ml-2">
              (todos os profissionais)
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => changeCalendarMonth(-1)} className="px-3 py-1 border rounded hover:bg-gray-50">◀</button>
            <span className="text-sm font-semibold w-40 text-center">
              {monthNames[parseInt(calendarViewMonth.split('-')[1]) - 1]} {calendarViewMonth.split('-')[0]}
            </span>
            <button onClick={() => changeCalendarMonth(1)} className="px-3 py-1 border rounded hover:bg-gray-50">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-2">
          {weekDays.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthCalendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="min-h-[100px]" />;
            const [y, m] = calendarViewMonth.split('-').map(Number);
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAppointments = monthAppointments.filter(a => a.date === dateStr);
            const isTodayDay = dateStr === todayStr;

            return (
              <div
                key={idx}
                className={`min-h-[100px] border rounded-md p-1 text-left
                  ${isTodayDay ? 'bg-yellow-50 border-yellow-400' : 'bg-white'}
                `}
              >
                <div className={`text-xs font-bold mb-1 ${isTodayDay ? 'text-yellow-700' : 'text-gray-600'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayAppointments.slice(0, 4).map((a) => {
                    const ben = beneficiaries.find(b => b.id === a.beneficiaryId);
                    const prof = professionals.find(p => p.id === a.professionalId);
                    const st = a.status || 'agendado';
                    return (
                      <Link
                        to="/agenda"
                        key={a.id}
                        className={`block text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate ${statusBarColors[st]} hover:opacity-90`}
                        title={`${a.time} - ${ben?.fullName || ''} - ${prof?.name || ''} - ${statusLabels[st]}`}
                      >
                        {a.time} {ben?.fullName?.split(' ')[0] || ''}
                      </Link>
                    );
                  })}
                  {dayAppointments.length > 4 && (
                    <div className="text-[10px] text-gray-500 font-semibold">
                      +{dayAppointments.length - 4} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block"></span> Agendado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Presente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block"></span> Falta</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span> Falta Justificada</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Cancelado</span>
        </div>
      </div>
    </div>
  );
}
