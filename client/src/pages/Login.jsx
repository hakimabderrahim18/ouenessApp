import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Fuel, Building2, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let msg =
        err.response?.data?.message?.[i18n.language] ||
        err.response?.data?.message?.ar ||
        err.message ||
        (i18n.language === 'ar' ? 'فشل التحقق من الهوية' : 'Identifiants invalides');

      if (err.response?.status === 405) {
        msg = i18n.language === 'ar'
          ? 'خطأ اتصال (405): يرجى إضافة المتغير VITE_API_BASE_URL في إعدادات Vercel برابط خادم Render، ثم إعادة النشر (Redeploy).'
          : 'Erreur de routage (405) : La variable VITE_API_BASE_URL n\'est pas configurée sur Vercel. Ajoutez-la dans Settings > Environment Variables avec l\'URL Render (ex: https://...onrender.com/api), puis faites Redeploy.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      code: 'DG-01',
      title: i18n.language === 'ar' ? 'المدير العام' : 'Directeur Général (GM)',
      name: i18n.language === 'ar' ? 'رحموني وناس' : 'RAHMOUNI OUNES',
      email: 'ounes.rahmouni@loginaft.dz',
      pass: 'Password@2026',
      roleBadge: 'Gouvernance',
      gradient: 'from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
    {
      code: 'DO-02',
      title: i18n.language === 'ar' ? 'مدير العمليات' : 'Directeur des Opérations (COO)',
      name: i18n.language === 'ar' ? 'قوراري يوسف' : 'GOURRARI YOUCEF',
      email: 'youcef.gourrari@loginaft.dz',
      pass: 'Password@2026',
      roleBadge: 'Dispatching',
      gradient: 'from-cyan-500/15 to-blue-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    },
    {
      code: 'WH-03',
      title: i18n.language === 'ar' ? 'مسؤول مستودع حاسي مسعود' : 'Resp. Dépôt Hassi Messaoud',
      name: 'Ahmed Benali',
      email: 'ahmed.benali@loginaft.dz',
      pass: 'Password@2026',
      roleBadge: 'Bacs & Stocks',
      gradient: 'from-emerald-500/15 to-teal-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      code: 'ADR-04',
      title: i18n.language === 'ar' ? 'سائق صهريج ADR' : 'Chauffeur Citerne ADR',
      name: 'Mustapha Khelifi',
      email: 'mustapha.khelifi@loginaft.dz',
      pass: 'Password@2026',
      roleBadge: 'Flotte RN3',
      gradient: 'from-blue-500/15 to-indigo-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    },
    {
      code: 'AUD-05',
      title: i18n.language === 'ar' ? 'مفتشة التدقيق والامتثال' : 'Auditrice & Conformité',
      name: 'Fatima Z. Boudjemaa',
      email: 'fatima.boudjemaa@loginaft.dz',
      pass: 'Password@2026',
      roleBadge: 'Audit Légal',
      gradient: 'from-purple-500/15 to-pink-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    },
    {
      code: 'ADM-00',
      title: i18n.language === 'ar' ? 'مسؤول النظام' : 'Administrateur Système',
      name: 'System Admin',
      email: 'admin@loginaft.dz',
      pass: 'Admin@2026',
      roleBadge: 'Super-User',
      gradient: 'from-rose-500/15 to-red-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    },
  ];

  const fillAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 select-none font-sans antialiased relative overflow-hidden glow-mesh w-full max-w-full overflow-x-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 pb-4 border-b border-slate-200/80 dark:border-slate-800 min-w-0">
        <NavLink to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0 group cursor-pointer" title="Page d'accueil">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-start min-w-0">
            <span className="font-title font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
              Logi<span className="text-cyan-500">Naft</span> Smart System
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:inline">
              Plateforme Logistique des Hydrocarbures en Algérie
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Fuseau : Africa/Algiers [UTC+1]
          </span>
          <LanguageSwitcher variant="buttons" />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch my-auto py-4 sm:py-6 z-10 min-w-0">
        {/* LEFT COLUMN: Modern Schematic Map of the 5 Hubs */}
        <div className="lg:col-span-7 p-4 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#111C30]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between text-start relative overflow-hidden w-full min-w-0 max-w-full">
          <div className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Réseau Logistique National</span>
              </span>
              <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                5 Hubs Stratégiques
              </span>
            </div>
            <h2 className="font-title font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              Supervision des Flux Pétroliers & Gaziers
            </h2>
          </div>

          {/* Clean Vector Visual Representation */}
          <div className="my-4 sm:my-6 p-2 sm:p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 relative shadow-inner w-full min-w-0 max-w-full overflow-hidden">
            <svg
              viewBox="0 0 500 270"
              className="w-full h-auto text-slate-700 dark:text-slate-300 stroke-current select-none"
              fill="none"
              strokeWidth="1.8"
            >
              {/* Highway Corridors */}
              <line x1="120" y1="75" x2="260" y2="65" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.8" />
              <line x1="260" y1="65" x2="410" y2="70" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.8" />
              <line x1="120" y1="75" x2="180" y2="145" stroke="#f59e0b" strokeWidth="2.5" opacity="0.85" />
              <line x1="330" y1="220" x2="260" y2="65" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" opacity="0.9" />
              <line x1="330" y1="220" x2="180" y2="145" stroke="#64748b" strokeDasharray="3 3" opacity="0.6" />

              {/* Corridor Labels */}
              <text x="180" y="55" fill="#0284c7" fontSize="10" fontWeight="bold" stroke="none">A1 EST-OUEST</text>
              <text x="325" y="60" fill="#0284c7" fontSize="10" fontWeight="bold" stroke="none">A1 EST</text>
              <text x="135" y="120" fill="#d97706" fontSize="10" fontWeight="bold" stroke="none">RN4</text>
              <text x="310" y="150" fill="#059669" fontSize="10" fontWeight="bold" stroke="none">RN3 TRANS-SAHARA</text>

              {/* Hub 1: Arzew */}
              <g transform="translate(120, 75)">
                <circle r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="-40" y="-18" fill="#0284c7" fontSize="11" fontWeight="bold" stroke="none">WH-ARZ-02</text>
                <text x="-40" y="24" fill="#64748b" fontSize="9" fontWeight="600" stroke="none">Arzew [Raffinerie]</text>
              </g>

              {/* Hub 2: Alger Sidi Arcine */}
              <g transform="translate(260, 65)">
                <circle r="14" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
                <text x="-35" y="-18" fill="#ea580c" fontSize="11" fontWeight="bold" stroke="none">WH-ALG-04</text>
                <text x="-35" y="26" fill="#64748b" fontSize="9" fontWeight="600" stroke="none">Alger [Dépôt Central]</text>
              </g>

              {/* Hub 3: Skikda */}
              <g transform="translate(410, 70)">
                <circle r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="-35" y="-18" fill="#0284c7" fontSize="11" fontWeight="bold" stroke="none">WH-SKI-03</text>
                <text x="-35" y="24" fill="#64748b" fontSize="9" fontWeight="600" stroke="none">Skikda [Raffinerie]</text>
              </g>

              {/* Hub 4: Tiaret */}
              <g transform="translate(180, 145)">
                <circle r="11" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="-30" y="24" fill="#d97706" fontSize="11" fontWeight="bold" stroke="none">WH-TIA-05</text>
                <text x="-30" y="36" fill="#64748b" fontSize="9" fontWeight="600" stroke="none">Tiaret [Hauts-Plateaux]</text>
              </g>

              {/* Hub 5: Hassi Messaoud */}
              <g transform="translate(330, 220)">
                <circle r="15" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <text x="22" y="-2" fill="#059669" fontSize="12" fontWeight="bold" stroke="none">WH-HMD-01</text>
                <text x="22" y="14" fill="#64748b" fontSize="9" fontWeight="600" stroke="none">Hassi Messaoud [Pôle Sud]</text>
              </g>
            </svg>
          </div>

          {/* Strategic Governance Footnote */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              Directeur Général : <strong className="text-slate-900 dark:text-white">RAHMOUNI OUNES</strong> (رحموني وناس)
            </div>
            <div>
              Directeur Opérations : <strong className="text-slate-900 dark:text-white">GOURRARI YOUCEF</strong> (قوراري يوسف)
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Clean Authentication Form */}
        <div className="lg:col-span-5 p-4 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#111C30]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between text-start w-full min-w-0 max-w-full">
          <div>
            {/* Header */}
            <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Accès Sécurisé
              </span>
              <h1 className="font-title font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
                Authentification Opérateur
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entrez vos identifiants professionnels pour accéder à la plateforme.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Adresse Électronique Professionnelle"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom.prenom@loginaft.dz"
                icon={Mail}
              />

              <div className="relative">
                <Input
                  label="Mot de Passe"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  icon={Lock}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Afficher/Masquer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  icon={ArrowRight}
                  iconPosition="end"
                >
                  {loading ? 'Vérification en cours...' : 'Ouvrir la Session'}
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Persona Access for Presentation & Testing */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Profils de Démonstration :
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">[1-Clic Remplir]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.code}
                  type="button"
                  onClick={() => fillAccount(acc)}
                  className={`p-2 rounded-xl text-start border transition-all duration-200 hover:-translate-y-0.5 shadow-sm bg-white dark:bg-slate-850 hover:border-cyan-500 ${acc.gradient}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>{acc.code}</span>
                    <span>{acc.roleBadge}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {acc.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Notice */}
      <div className="w-full max-w-6xl mx-auto pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400 flex flex-wrap justify-between gap-2 z-10">
        <span>LogiNaft Smart System // Version 1.2.0 Production</span>
        <span>Conformité ADR Matières Dangereuses Classes 2 & 3</span>
      </div>
    </div>
  );
};

export default Login;
