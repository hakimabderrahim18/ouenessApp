import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Boxes,
  AlertTriangle,
  Award,
  Activity,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  FileText,
  Bot,
  Route,
  Building2,
  CheckCircle2,
  Fuel,
  Sparkles,
} from 'lucide-react';

import HazardBanner from '../components/industrial/HazardBanner';
import KpiStrip from '../components/industrial/KpiStrip';
import TankGauge from '../components/industrial/TankGauge';
import FleetMap from '../components/industrial/FleetMap';
import ShipmentTimeline from '../components/industrial/ShipmentTimeline';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge, AdrDiamond } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Operational Sub-views for Field Warehouse Worker and Driver Mobile
import WarehouseDashboard from './WarehouseDashboard';
import DriverMobile from './DriverMobile';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('executive'); // 'executive' | 'warehouse' | 'driver'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Fetch dashboard analytics failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const kpis = data?.kpis || {
    totalFuelLiters: 4850000,
    ongoingShipments: 3,
    delayedShipments: 1,
    arrivedShipments: 4,
    onTimeRate: 98.4,
    lowStockAlerts: 1,
    totalWarehouses: 5,
    totalActiveEmployees: 7,
  };

  // Real Algerian Strategic Bacs Data
  const tanks = [
    {
      id: 'TK-ALG-G01',
      product: 'GASOIL 10 PPM',
      category: 'fuel',
      depot: 'WH-ALG-04 (ALGER)',
      current: 7400,
      capacity: 50000,
      min: 10000,
      temp: 23.1,
      density: 0.835,
      adr: '3',
    },
    {
      id: 'TK-ARZ-SP02',
      product: 'SANS PLOMB 95',
      category: 'fuel',
      depot: 'WH-ARZ-02 (ARZEW)',
      current: 39400,
      capacity: 50000,
      min: 10000,
      temp: 21.8,
      density: 0.742,
      adr: '3',
    },
    {
      id: 'TK-TIA-P35',
      product: 'PROPANE P35 (GPL)',
      category: 'gas',
      depot: 'WH-TIA-05 (TIARET)',
      current: 8200,
      capacity: 25000,
      min: 5000,
      temp: 18.5,
      density: 0.510,
      adr: '2',
    },
    {
      id: 'TK-HMD-JET',
      product: 'JET A-1 AVIATION',
      category: 'fuel',
      depot: 'WH-HMD-01 (HASSI MESSAOUD)',
      current: 34150,
      capacity: 40000,
      min: 8000,
      temp: 24.2,
      density: 0.804,
      adr: '3',
    },
  ];

  // Active Shipments Real Convoys
  const activeShipments = [
    {
      ref: 'BL-2026-0042',
      product: 'Gasoil 10 PPM',
      volume: '38 450 L',
      adr: '3',
      truck: '00421-120-30',
      driver: 'K. Benali (ADR-09)',
      route: 'Hassi Messaoud → Alger',
      corridor: 'RN3 Trans-Sahara',
      eta: '18:30 [UTC+1]',
      status: 'ON_TIME',
    },
    {
      ref: 'BL-2026-0045',
      product: 'Sans Plomb 95',
      volume: '39 100 L',
      adr: '3',
      truck: '01892-122-16',
      driver: 'M. Cherif (ADR-14)',
      route: 'Arzew → Tiaret',
      corridor: 'RN4 Hauts-Plateaux',
      eta: '16:45 [UTC+1]',
      status: 'ON_TIME',
    },
    {
      ref: 'BL-2026-0039',
      product: 'Jet A-1 Aviation',
      volume: '36 800 L',
      adr: '3',
      truck: '00733-121-21',
      driver: 'R. Belkacem (ADR-02)',
      route: 'Skikda → Alger Aéroport',
      corridor: 'Autoroute A1 Est',
      eta: '15:10 [UTC+1]',
      status: 'DELAYED',
    },
  ];

  // Recharts Real Hydrocarbon Distribution
  const warehouseStocks = [
    { name: 'Arzew', volume: 4120 },
    { name: 'Skikda', volume: 3940 },
    { name: 'H. Messaoud', volume: 2850 },
    { name: 'Alger', volume: 1480 },
    { name: 'Tiaret', volume: 890 },
  ];

  // Render alternate views if user selected Quai or Chauffeur
  if (activeView === 'warehouse') {
    return (
      <div className="space-y-6">
        {renderViewToggleBar(activeView, setActiveView, i18n)}
        <WarehouseDashboard />
      </div>
    );
  }

  if (activeView === 'driver') {
    return (
      <div className="space-y-6">
        {renderViewToggleBar(activeView, setActiveView, i18n)}
        <DriverMobile />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 text-start font-sans antialiased w-full min-w-0 max-w-full overflow-hidden">
      {/* ────────────────── MODERN WELCOME & EXECUTIVE HERO ────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-600 dark:from-[#0d2238] dark:via-[#0e3247] dark:to-[#0b2b36] p-4 sm:p-8 text-white shadow-xl min-w-0 max-w-full">
        {/* Glow orb decorations */}
        <div className="absolute -top-24 -end-24 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 min-w-0">
          <div className="space-y-2 min-w-0 max-w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-bold border border-white/20 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="truncate">LogiNaft Smart DZ | Réseau Énergétique National</span>
              <span className="text-cyan-200 shrink-0">● UTC+1</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight break-words">
              Tableau de Bord National des Opérations & Approvisionnement
            </h1>

            <p className="text-cyan-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervision unifiée des réserves volumétriques de carburants, du transport lourd ADR, et de la géolocalisation de flotte entre les pôles de raffinage et les dépôts régionaux.
            </p>

            {/* Senior Management Badge Showcase */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs">
                👑 DG : <strong className="text-white font-bold">RAHMOUNI OUNES</strong> (رحموني وناس)
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs">
                ⚡ DO : <strong className="text-white font-bold">GOURRARI YOUCEF</strong> (قوراري يوسف)
              </span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <NavLink to="/tracking" className="flex-1 sm:flex-initial">
              <Button variant="emerald" size="md" icon={MapPin} fullWidth>
                Carte Plein Écran
              </Button>
            </NavLink>
            <NavLink to="/ai-assistant" className="flex-1 sm:flex-initial">
              <Button variant="secondary" size="md" icon={Bot} fullWidth>
                Assistant IA
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      {/* ────────────────── OPERATIONAL VIEW SELECTOR TABS ────────────────── */}
      {renderViewToggleBar(activeView, setActiveView, i18n)}

      {/* ────────────────── CRITICAL HAZARD BANNER ────────────────── */}
      {!alertDismissed && (
        <HazardBanner
          code="ALERTE-BAC-CRIT-ALG04"
          depot="WH-ALG-04 (SIDI ARCINE / ALGER)"
          product="GASOIL 10 PPM"
          level="14.8 % (7 400 L / 50 000 L)"
          autonomy="< 32 HEURES"
          actionLabel="DÉCLENCHER RÉÉQUILIBRAGE ARZEW → ALGER"
          onAction={() => alert('Ordre de transfert prioritaire émis : Référence TR-2026-092 (RN4/A1)')}
          dismissable={true}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* ────────────────── 5 VIBRANT KPI CARDS ────────────────── */}
      <KpiStrip />

      {/* ────────────────── ROW 2: TANK GAUGES & REAL-TIME FLEET MAP ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 Cols): Real-time Tanks */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white">
                  Jaugeage Bacs en Direct
                </h3>
                <p className="text-xs text-slate-400">4 Bacs Stratégiques Surveillés</p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2.5 py-1 rounded-full">
              Capteurs OK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {tanks.map((t) => (
              <TankGauge
                key={t.id}
                tankId={t.id}
                productName={t.product}
                productCategory={t.category}
                depot={t.depot}
                currentLiters={t.current}
                maxCapacity={t.capacity}
                minThreshold={t.min}
                temperature={t.temp}
                density={t.density}
                adrClass={t.adr}
              />
            ))}
          </div>
        </div>

        {/* Right Column (7 Cols): Modern Interactive Fleet Map */}
        <div className="lg:col-span-7 flex flex-col">
          <FleetMap height="450px" />
        </div>
      </div>

      {/* ────────────────── ROW 3: CONVOY TIMELINE STEPPER ────────────────── */}
      <ShipmentTimeline
        shipmentRef="BL-2026-0042"
        currentStep={3}
        isDelayed={false}
        eta="2026-10-29 18:30 [UTC+1]"
      />

      {/* ────────────────── ROW 4: CHARTS & ACTIVE FLEET REGISTRY ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (4 Cols): Reserves by Hub Chart */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <div>
              <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white">
                Réserves par Pôle (m³)
              </h3>
              <p className="text-xs text-slate-400">Capacité disponible en temps réel</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              Stable J-1
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseStocks} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}k`} />
                <RechartsTooltip
                  formatter={(val) => [`${val.toLocaleString()} m³`, 'Volume disponible']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  }}
                />
                <Bar dataKey="volume" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total National : <strong>13 280 m³</strong></span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">5 Dépôts Connectés</span>
          </div>
        </div>

        {/* Right Column (8 Cols): Active ADR Fleet Registry */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white">
                  Convois de Transport Lourd ADR en Mission
                </h3>
                <p className="text-xs text-slate-400">Citernes en transit actif sur les corridors nationaux</p>
              </div>
            </div>

            <NavLink to="/shipments">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="end">
                Voir Tout
              </Button>
            </NavLink>
          </div>

          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHead>Réf BL</TableHead>
                <TableHead>Matricule Citerne</TableHead>
                <TableHead>Cargaison & ADR</TableHead>
                <TableHead>Chauffeur</TableHead>
                <TableHead>Corridor</TableHead>
                <TableHead align="end">Volume</TableHead>
                <TableHead align="center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeShipments.map((s) => (
                <TableRow key={s.ref}>
                  <TableCell mono className="font-bold text-cyan-600 dark:text-cyan-400">
                    {s.ref}
                  </TableCell>
                  <TableCell mono>{s.truck}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.product}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        CL.{s.adr}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                    {s.driver}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                    {s.corridor}
                  </TableCell>
                  <TableCell mono align="end" className="font-bold">
                    {s.volume}
                  </TableCell>
                  <TableCell align="center">
                    {s.status === 'DELAYED' ? (
                      <Badge variant="danger" size="xs">
                        Retard ETA
                      </Badge>
                    ) : (
                      <Badge variant="success" size="xs">
                        En Route
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Réglementation ADR : Vitesse max 80 km/h sur axe saharien RN3</span>
            <span className="text-emerald-500 font-bold">100% Flotte Connectée GPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern operational view switcher bar
function renderViewToggleBar(activeView, setActiveView, i18n) {
  return (
    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none w-full min-w-0 max-w-full">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase ps-1 w-full sm:w-auto mb-1 sm:mb-0">
          Mode Opérationnel :
        </span>
        <button
          onClick={() => setActiveView('executive')}
          className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs flex-1 sm:flex-initial text-center ${
            activeView === 'executive'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🏢 [01] <span className="hidden xs:inline">Direction</span> DG / DO
        </button>
        <button
          onClick={() => setActiveView('warehouse')}
          className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs flex-1 sm:flex-initial text-center ${
            activeView === 'warehouse'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          ⛽ [02] <span className="hidden xs:inline">Poste Quai &</span> Bacs
        </button>
        <button
          onClick={() => setActiveView('driver')}
          className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs flex-1 sm:flex-initial text-center ${
            activeView === 'driver'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🚛 [03] Chauffeur ADR
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
        <span className="truncate">Gouvernance : RAHMOUNI Ounes & GOURRARI Youcef</span>
      </div>
    </div>
  );
}

export default Dashboard;
