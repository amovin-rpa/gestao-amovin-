import React from 'react';
import { useStore } from '../store';
import { isThisWeek, parseISO } from 'date-fns';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

import ConsultationsList from './ConsultationsList';

export default function DashboardHome() {
  const { currentUser, consultations, beneficiaries, schedule, professionals } = useStore();

  const thisWeekAbsences = consultations.filter(
    (c) => c.attendance === 'falta' && isThisWeek(parseISO(c.date))
  );

  if (currentUser?.role === 'consulta') {
    return <ConsultationsList />;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-200 to-white p-8 shadow-xl shadow-yellow-900/10 border border-yellow-200">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="h-20 w-auto object-contain mb-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-900">Gestao Amovin Integrado</p>
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
                  return (
                    <li key={c.id}>
                      {b?.fullName || 'Desconhecido'} - {new Date(c.date).toLocaleDateString()}
                    </li>
                  )
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
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agenda Completa dos Profissionais</h2>
            {schedule.length === 0 ? <p className="text-sm text-gray-500">Nenhum agendamento cadastrado.</p> : (
              <div className="space-y-3">
                {[...schedule].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 8).map((item) => {
                  const beneficiary = beneficiaries.find((b) => b.id === item.beneficiaryId);
                  const professional = professionals.find((p) => p.id === item.professionalId);
                  return <div key={item.id} className="rounded-xl border border-yellow-100 bg-yellow-50/40 p-3 text-sm"><strong>{new Date(`${item.date}T${item.time}`).toLocaleString()}</strong> - {item.type}<br/>{beneficiary?.fullName || 'Beneficiário'} com {professional?.name || 'Profissional'}</div>;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}