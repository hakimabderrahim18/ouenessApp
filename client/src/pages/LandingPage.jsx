import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import {
  Truck,
  Boxes,
  MapPin,
  Route,
  ShieldCheck,
  Bot,
  FileText,
  Award,
  ArrowRight,
  Sun,
  Moon,
  Building,
  CheckCircle2,
  Fuel,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AdrDiamond } from '../components/ui/Badge';

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const hubs = [
    {
      code: 'WH-HMD-01',
      name: i18n.language === 'ar' ? 'حاسي مسعود (ورقلة)' : 'Hassi Messaoud (Pôle Sud / Ouargla)',
      type: i18n.language === 'ar' ? 'مصفاة ومجمع بترولي رئيسي' : 'Raffinerie & Pôle Amont Sahara',
      capacity: '15 000 000 L',
      corridor: 'RN3 Trans-Sahara',
      coords: '31.68° N, 6.07° E',
      badge: 'Pôle Amont',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      code: 'WH-ARZ-02',
      name: i18n.language === 'ar' ? 'أرزيو (وهران)' : 'Arzew (Pôle Ouest / Oran)',
      type: i18n.language === 'ar' ? 'مجمع بتروكيماوي وميناء تصدير' : 'Pôle Raffinage & Export GPL',
      capacity: '18 000 000 L',
      corridor: 'Autoroute A1 / RN4',
      coords: '35.85° N, -0.31° W',
      badge: 'Raffinage & GPL',
      gradient: 'from-blue-600 to-cyan-500',
    },
    {
      code: 'WH-SKI-03',
      name: i18n.language === 'ar' ? 'سكيكدة' : 'Skikda (Pôle Est)',
      type: i18n.language === 'ar' ? 'مستودع تموين الطيران والوقود' : 'Raffinerie Côtière & Jet A-1',
      capacity: '12 000 000 L',
      corridor: 'Autoroute A1 Est',
      coords: '36.87° N, 6.90° E',
      badge: 'Terminal Jet A-1',
      gradient: 'from-indigo-600 to-blue-500',
    },
    {
      code: 'WH-ALG-04',
      name: i18n.language === 'ar' ? 'الجزائر العاصمة (سيدي رزين)' : 'Alger (Sidi Arcine / Baraki)',
      type: i18n.language === 'ar' ? 'مستودع التوزيع المركزي' : 'Dépôt Central de Distribution',
      capacity: '8 000 000 L',
      corridor: 'Hub Métropolitain',
      coords: '36.70° N, 3.12° E',
      badge: 'Hub Capitale',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      code: 'WH-TIA-05',
      name: i18n.language === 'ar' ? 'تيارت' : 'Tiaret (Hauts-Plateaux)',
      type: i18n.language === 'ar' ? 'المستودع الاستراتيجي للهضاب العليا' : 'Dépôt Régional Hauts-Plateaux',
      capacity: '5 000 000 L',
      corridor: 'Corridor RN4 Agro-Pastoral',
      coords: '35.37° N, 1.31° E',
      badge: 'Hauts-Plateaux',
      gradient: 'from-teal-600 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased relative overflow-hidden glow-mesh w-full max-w-full overflow-x-hidden">
      {/* ────────────────── TOPBAR ────────────────── */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#111C30]/80 backdrop-blur-md sticky top-0 z-40 py-3 px-3 sm:px-6 shadow-sm w-full max-w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <NavLink to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer" title="Page d'accueil">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col text-start leading-tight min-w-0">
              <span className="font-title font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                Logi<span className="text-cyan-500">Naft</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden xs:inline">
                Smart DZ // Logistics
              </span>
            </div>
          </NavLink>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher variant="buttons" />

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Thème"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <NavLink to="/login">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="end">
                <span className="hidden sm:inline">{user ? 'Ouvrir Dashboard' : 'Accéder au Système'}</span>
                <span className="sm:hidden">{user ? 'Dashboard' : 'Accès'}</span>
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* ────────────────── HERO BANNER ────────────────── */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 text-start relative z-10 w-full min-w-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-w-0">
          <div className="lg:col-span-8 space-y-4 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span className="truncate">Système National Intégré // Écosystème Énergétique Algérien</span>
            </div>

            <h1 className="font-title font-black text-2xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight break-words">
              Gestion Intelligente & Traçabilité de la Chaîne Logistique des <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">Hydrocarbures</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
              Pilotage en temps réel du stockage pétrolier (cuves & bacs), du transport lourd certifié ADR, de la télémétrie GPS des convois sur les corridors nationaux, et de la génération des documents officiels conformes.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full">
              <NavLink to="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="md" icon={ArrowRight} iconPosition="end" fullWidth>
                  Accéder à la Plateforme
                </Button>
              </NavLink>

              <NavLink to="/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" fullWidth>
                  Vue DG / DO
                </Button>
              </NavLink>

              <NavLink to="/warehouse" className="w-full sm:w-auto">
                <Button variant="outline" size="md" fullWidth>
                  Poste de Quai
                </Button>
              </NavLink>

              <NavLink to="/driver-mobile" className="w-full sm:w-auto">
                <Button variant="safety" size="md" fullWidth>
                  Terminal Chauffeur
                </Button>
              </NavLink>
            </div>
          </div>

          {/* Right Governance Box with High Visual Impact */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white/90 dark:bg-[#111C30]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-500" />
                <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Direction Générale
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Directeur Général (GM) :</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  RAHMOUNI OUNES
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold block text-[11px]">
                  رحموني وناس // Matricule : DZ-2026-GM01
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Directeur des Opérations (COO) :</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  GOURRARI YOUCEF
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold block text-[11px]">
                  قوراري يوسف // Matricule : DZ-2026-COO
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Agrément ADR : ADR-DZ-2026</span>
              <span className="text-emerald-500 font-bold">Statut Actif</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── METRIC RIBBON ────────────────── */}
      <section className="py-4 px-4 sm:px-6 border-y border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#111C30]/60 backdrop-blur-md w-full min-w-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-start min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-medium uppercase truncate">Capacité Gérée</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">13.28 M Litres</div>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-medium uppercase truncate">Service OTIF</div>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 truncate">98.4 % Conforme</div>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-medium uppercase truncate">Coût Carburant</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">9.86 DZD / km</div>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-medium uppercase truncate">Fuseau National</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">Africa/Algiers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── NATIONAL NETWORK HUBS ────────────────── */}
      <section className="py-12 px-4 sm:px-6 text-start">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="font-title font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                Réseau des Hubs Stratégiques & Corridors
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                5 plateformes interconnectées assurant l'alimentation continue des bassins nationaux
              </p>
            </div>
            <AdrDiamond classType="3" label="CLASSE 3" subtext="" className="scale-90" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hubs.map((h) => (
              <div
                key={h.code}
                className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {h.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {h.badge}
                    </span>
                  </div>

                  <h3 className="font-title font-bold text-base text-slate-900 dark:text-white">
                    {h.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{h.type}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacité :</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{h.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Corridor :</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{h.corridor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111C30] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>LogiNaft Smart System // Modèle Supply Chain Énergétique Algérie</span>
          <span>Direction Générale : RAHMOUNI Ounes & GOURRARI Youcef</span>
          <span>Version 1.2.0 Production</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
