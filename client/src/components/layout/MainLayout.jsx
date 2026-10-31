import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  MapPin,
  Users,
  Shield,
  FileText,
  FileSpreadsheet,
  Activity,
  Bot,
  Route,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Building,
  Award,
  Fuel,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // High precision Algerian live clock (Africa/Algiers UTC+1)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const localeMap = { ar: 'ar-DZ', fr: 'fr-DZ', en: 'en-US' };
  const currentLocale = localeMap[i18n.language] || 'fr-DZ';

  const algeriaDateStr = currentTime.toLocaleDateString(currentLocale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Algiers',
  });

  const algeriaTimeStr = currentTime.toLocaleTimeString(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Africa/Algiers',
  });

  // Organized navigation groups with icons and permission checks
  const navSections = [
    {
      group: i18n.language === 'ar' ? 'القيادة والاستراتيجية' : 'Pilotage & Stratégie',
      items: [
        {
          title: t('nav.dashboard'),
          path: '/dashboard',
          icon: LayoutDashboard,
          code: 'DB-01',
          permission: null,
        },
        {
          title: t('nav.seniorManagement'),
          path: '/senior-management',
          icon: Award,
          code: 'DG-00',
          badge: 'DG / DO',
          badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
          permission: null,
        },
      ],
    },
    {
      group: i18n.language === 'ar' ? 'النقل والتتبع الميداني' : 'Transport & Télémétrie Flotte',
      items: [
        {
          title: t('nav.tracking'),
          path: '/tracking',
          icon: MapPin,
          code: 'GPS-02',
          badge: 'LIVE',
          badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse',
          permission: 'tracking:view',
        },
        {
          title: t('nav.shipments'),
          path: '/shipments',
          icon: Truck,
          code: 'TR-03',
          permission: 'shipments:view',
        },
        {
          title: t('nav.routes'),
          path: '/routes',
          icon: Route,
          code: 'RO-04',
          permission: 'shipments:view',
        },
      ],
    },
    {
      group: i18n.language === 'ar' ? 'المخزون وحجم الباك' : 'Gestion des Bacs & Stocks',
      items: [
        {
          title: t('nav.inventory'),
          path: '/inventory',
          icon: Boxes,
          code: 'INV-05',
          permission: 'inventory:view',
        },
      ],
    },
    {
      group: i18n.language === 'ar' ? 'الوثائق والامتثال' : 'Conformité & Registre Légal',
      items: [
        {
          title: t('nav.documents'),
          path: '/documents',
          icon: FileText,
          code: 'DOC-06',
          permission: 'documents:view',
        },
        {
          title: t('nav.audit'),
          path: '/audit',
          icon: Activity,
          code: 'AUD-07',
          permission: 'audit:view',
        },
        {
          title: t('nav.reports'),
          path: '/reports',
          icon: FileSpreadsheet,
          code: 'RPT-08',
          permission: 'reports:view',
        },
      ],
    },
    {
      group: i18n.language === 'ar' ? 'النظام والذكاء الاصطناعي' : 'Système & IA Assist',
      items: [
        {
          title: t('nav.aiAssistant'),
          path: '/ai-assistant',
          icon: Bot,
          code: 'AI-09',
          badge: 'AI',
          badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
          permission: 'ai_assistant:view',
        },
        {
          title: t('nav.users'),
          path: '/users',
          icon: Users,
          code: 'USR-10',
          permission: 'users:view',
        },
        {
          title: t('nav.roles'),
          path: '/roles',
          icon: Shield,
          code: 'RL-11',
          permission: 'roles:view',
        },
      ],
    },
  ];

  const userDisplayName = i18n.language === 'ar'
    ? user?.fullName?.ar || user?.fullName?.latin
    : user?.fullName?.latin || user?.fullName?.ar;

  const userJobTitle = user?.jobTitle?.[i18n.language] || user?.jobTitle?.ar || user?.role?.displayName?.[i18n.language];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* ────────────────── RESPONSIVE MODERN TOPBAR ────────────────── */}
      <header className="h-14 sm:h-16 w-full max-w-full bg-white/95 dark:bg-[#111C30]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <NavLink to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" title="Page d'accueil">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col text-start leading-tight min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-title font-black text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white truncate">
                  Logi<span className="text-cyan-500">Naft</span>
                </span>
                <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                  Smart DZ
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline truncate">
                Logistique Énergie Algérie
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: System Status & Strict Algiers Daily Timestamp (Hidden on small mobile) */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {algeriaDateStr}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{algeriaTimeStr}</span>
            <span className="text-[10px] font-normal text-slate-400">DZ (UTC+1)</span>
          </div>
        </div>

        {/* Right Controls: Compact and Phone-Optimized */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <LanguageSwitcher variant="buttons" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification Bell (Hidden on very narrow screens < 360px if needed) */}
          <button
            className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Alertes opérationnelles"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </button>

          {/* User Profile Capsule */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-600/20 shrink-0">
                {userDisplayName?.slice(0, 1) || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-start leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold truncate max-w-[120px]">
                  {userJobTitle || 'Opérateur'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute end-0 mt-2 w-56 sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  <div className="p-3.5 text-start bg-slate-50/70 dark:bg-slate-850">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {userDisplayName}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                      {user?.email}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
                      <span>MATRICULE :</span>
                      <span>{user?.professionalId || 'DZ-2026-OP'}</span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <NavLink
                      to="/senior-management"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-3 py-2 text-start text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Organigramme Direction</span>
                    </NavLink>
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 text-start text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ────────────────── MAIN BODY + RESPONSIVE SIDEBAR ────────────────── */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 ${i18n.language === 'ar' ? 'right-0 border-s' : 'left-0 border-e'}
            z-50 w-72 max-w-[85vw] bg-white dark:bg-[#111C30] border-slate-200/80 dark:border-slate-800 flex flex-col justify-between
            transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
            ${sidebarOpen ? 'translate-x-0' : i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full'}
          `}
        >
          {/* Mobile close bar */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 lg:hidden bg-slate-50 dark:bg-slate-850">
            <span className="font-title font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Navigation Logistique
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Grouped By Industrial Discipline */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {navSections.map((sec, idx) => {
              const visibleItems = sec.items.filter(
                (item) => !item.permission || hasPermission(item.permission)
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-start">
                    {sec.group}
                  </div>

                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/20'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.badge ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer (Senior Governance Reference) */}
          <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl m-3 text-start space-y-2 border">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-500" />
                <span>Direction Générale</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">DZ ●</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              DG : <strong className="text-slate-900 dark:text-white">RAHMOUNI OUNES</strong>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              DO : <strong className="text-slate-900 dark:text-white">GOURRARI YOUCEF</strong>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between font-mono">
              <span>Écosystème Naftal</span>
              <span>v1.2.0</span>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* Main Content Area: Zero Horizontal Scroll */}
        <main className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <div className="w-full max-w-[1440px] mx-auto min-w-0 space-y-5 sm:space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
