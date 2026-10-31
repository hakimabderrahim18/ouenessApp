import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Award, Phone, Mail, Building, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const SeniorManagement = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeniorManagement = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/senior-management');
        if (res.data?.success) {
          setManagers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch senior management:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeniorManagement();
  }, []);

  const generalManager = managers.find(
    (m) => m.seniorityRank === 1 || m.role?.name === 'GENERAL_MANAGER'
  ) || {
    fullName: { ar: 'رحموني وناس', latin: 'RAHMOUNI Ounes' },
    professionalId: 'DZ-2026-GM01',
    email: 'ounes.rahmouni@loginaft.dz',
    phone: '+213 21 00 11 22',
    jobTitle: { ar: 'المدير العام للمؤسسة', fr: 'Directeur Général', en: 'General Manager' },
  };

  const operationsManager = managers.find(
    (m) => m.seniorityRank === 2 || m.role?.name === 'OPERATIONS_MANAGER'
  ) || {
    fullName: { ar: 'قوراري يوسف', latin: 'GOURRARI Youcef' },
    professionalId: 'DZ-2026-COO',
    email: 'youcef.gourrari@loginaft.dz',
    phone: '+213 21 00 33 44',
    jobTitle: { ar: 'مدير العمليات وسلاسل الإمداد', fr: 'Directeur des Opérations', en: 'Operations Manager' },
  };

  return (
    <div className="space-y-6 text-start font-sans antialiased select-none w-full min-w-0 max-w-full overflow-hidden">
      {/* Official Organigram Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 truncate">
              Gouvernance Exécutive & Haut Commandement
            </span>
          </div>
          <h1 className="font-title font-black text-lg sm:text-2xl text-slate-900 dark:text-white break-words">
            Direction Générale & Structure Organisationnelle
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Agrément Ministériel & Tutelle Énergétique (Secteur Hydrocarbures Algérie)
          </p>
        </div>

        <Badge variant="petrol" size="md" glow className="shrink-0">
          Structure Agréée 2026
        </Badge>
      </div>

      {/* Hierarchical Structure Visual Chart */}
      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-6 pt-2 w-full min-w-0">
        {/* Tier 1: General Manager Card */}
        <div className="w-full max-w-xl p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-700 via-cyan-700 to-teal-700 text-white shadow-xl relative overflow-hidden group min-w-0">
          <div className="absolute top-0 end-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/20">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>[Rang 01] Direction Générale</span>
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold">
              {generalManager.professionalId}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="font-title font-black text-xl sm:text-2xl text-white break-words">
              {generalManager.fullName.latin} ({generalManager.fullName.ar})
            </h2>
            <div className="text-xs sm:text-sm font-semibold text-cyan-100">
              {generalManager.jobTitle.fr} // {generalManager.jobTitle.ar}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-cyan-200 shrink-0" />
              <span className="truncate">{generalManager.email}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-4 h-4 text-cyan-200 shrink-0" />
              <span className="truncate">{generalManager.phone}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-cyan-100 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 leading-relaxed">
            Prérogatives : Arbitrage macro-logistique, validation des bilans d'audit, relations de tutelle et supervision des indicateurs nationaux.
          </div>
        </div>

        {/* Vertical Connector */}
        <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />

        {/* Tier 2: Operations Manager Card */}
        <div className="w-full max-w-xl p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-lg text-slate-800 dark:text-slate-100 relative overflow-hidden group min-w-0">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>[Rang 02] Direction des Opérations</span>
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
              {operationsManager.professionalId}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="font-title font-black text-xl sm:text-2xl text-slate-900 dark:text-white break-words">
              {operationsManager.fullName.latin} ({operationsManager.fullName.ar})
            </h2>
            <div className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              {operationsManager.jobTitle.fr} // {operationsManager.jobTitle.ar}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 truncate">{operationsManager.email}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 truncate">{operationsManager.phone}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
            Prérogatives : Pilotage direct de la flotte de citernes, équilibrage inter-bassins (Arzew-Skikda-Alger), dispatching d'urgence et sécurité ADR.
          </div>
        </div>

        {/* Vertical Connector */}
        <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />

        {/* Tier 3: Field Operations Hubs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm text-start space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Chefs de Dépôts (x5)</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Exploitation Bacs</div>
            <p className="text-[11px] text-slate-500">Hassi Messaoud, Arzew, Skikda, Alger, Tiaret</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm text-start space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Dispatching Flotte</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Chauffeurs ADR (x18)</div>
            <p className="text-[11px] text-slate-500">Corridors RN3, RN4, A1 Est-Ouest</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm text-start space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Audit & Sécurité</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Contrôle Immuable</div>
            <p className="text-[11px] text-slate-500">Rapprochement volumétrique & conformité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorManagement;
