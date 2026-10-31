import React from 'react';
import { CheckCircle2, AlertTriangle, Fuel, Activity, Truck, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Modern High-Impact KPI Cards Strip
 * Vivid colors, gradient icon badges, smooth hover elevation, high eye impact.
 */
export const KpiStrip = ({ metrics = [] }) => {
  const defaultMetrics = [
    {
      code: 'OTIF-01',
      label: 'Taux Service OTIF',
      value: '98.4',
      unit: '%',
      subtext: 'Livraisons conformes sans délai',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      shadowColor: 'hover:shadow-emerald-500/15',
      trend: '+0.3% vs J-7',
      trendPositive: true,
    },
    {
      code: 'COV-02',
      label: 'Couverture Critique',
      value: '3',
      unit: 'Wilayas',
      subtext: 'Autonomie < 72h (Alger, Tiaret)',
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      shadowColor: 'hover:shadow-amber-500/15',
      trend: 'Tension estivale',
      trendPositive: false,
    },
    {
      code: 'CST-03',
      label: 'Coût Kilométrique',
      value: '9.86',
      unit: 'DZD/km',
      subtext: '34 L/100km @ 29.01 DZD/L',
      icon: Fuel,
      gradient: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      shadowColor: 'hover:shadow-cyan-500/15',
      trend: '-0.14 DZD optimisé',
      trendPositive: true,
    },
    {
      code: 'VOL-04',
      label: 'Écart de Jaugeage',
      value: '-0.12',
      unit: '%',
      subtext: 'Correction thermique 15°C',
      icon: Activity,
      gradient: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      shadowColor: 'hover:shadow-purple-500/15',
      trend: 'Tolérance < 0.3%',
      trendPositive: true,
    },
    {
      code: 'FLT-05',
      label: 'Flotte Citernes ADR',
      value: '14/18',
      unit: 'Convois',
      subtext: 'Rotation nationale active',
      icon: Truck,
      gradient: 'from-blue-600 to-cyan-500',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      shadowColor: 'hover:shadow-blue-500/15',
      trend: '4 en maintenance',
      trendPositive: true,
    },
  ];

  const items = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full select-none text-start">
      {items.map((item, idx) => {
        const Icon = item.icon || Activity;

        return (
          <div
            key={idx}
            className={`
              relative p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800
              shadow-sm hover:shadow-xl ${item.shadowColor || 'hover:shadow-cyan-500/15'}
              hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden
            `}
          >
            {/* Top decorative gradient ambient line */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.gradient}`} />

            {/* Header: Label + Gradient Icon */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Metric Value & Unit */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-title font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {item.value}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {item.unit}
              </span>
            </div>

            {/* Contextual Subtext & Trend Badge */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                {item.subtext}
              </span>
              {item.trend && (
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${item.badgeColor}`}>
                  {item.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiStrip;
