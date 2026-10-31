import React from 'react';
import { AdrDiamond } from '../ui/Badge';
import { Thermometer, Droplet, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Modern High-Impact Tank Gauge Component (Jauge Cylindrique de Bac Pétrolier)
 * Translucent glass visual container, glowing liquid gradient, clear safety thresholds.
 */
export const TankGauge = ({
  tankId = 'BAC-TK-01',
  productName = 'GASOIL 10 PPM',
  productCategory = 'fuel',
  depot = 'WH-HMD-01 (HASSI MESSAOUD)',
  currentLiters = 38450,
  maxCapacity = 50000,
  minThreshold = 10000,
  temperature = 22.4,
  density = 0.835,
  adrClass = '3',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentLiters / maxCapacity) * 1000) / 10));
  const isCritical = currentLiters <= minThreshold;
  const isWarning = currentLiters <= minThreshold * 1.5 && !isCritical;

  // Modern liquid gradient based on status & product category
  const liquidGradient = isCritical
    ? 'from-rose-600 via-red-500 to-orange-500'
    : isWarning
    ? 'from-amber-500 via-yellow-500 to-orange-400'
    : productCategory === 'gas'
    ? 'from-amber-500 via-orange-500 to-yellow-400'
    : 'from-blue-600 via-cyan-500 to-teal-400';

  const glowShadow = isCritical
    ? 'shadow-rose-500/20'
    : isWarning
    ? 'shadow-amber-500/20'
    : 'shadow-cyan-500/20';

  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl ${glowShadow} hover:-translate-y-1 transition-all duration-300 flex flex-col text-start select-none group`}>
      {/* Tank Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {tankId}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
              {depot.split(' ')[0]}
            </span>
          </div>
          <h4 className="font-title font-bold text-sm text-slate-900 dark:text-white mt-0.5 truncate max-w-[190px]">
            {productName}
          </h4>
        </div>

        <AdrDiamond classType={adrClass} label={`CL.${adrClass}`} subtext="" className="scale-90 shrink-0" />
      </div>

      {/* Main Tank Body & Liquid Column */}
      <div className="flex items-center gap-4 my-4">
        {/* Visual Glass Column */}
        <div className="relative w-14 h-40 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 p-1 shrink-0 flex flex-col justify-end overflow-hidden shadow-inner">
          {/* Critical Threshold Marking (20%) */}
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-rose-500 z-10 flex items-center justify-end pe-1 pointer-events-none"
            style={{ bottom: '20%' }}
            title="Seuil Critique (20%)"
          >
            <span className="text-[8px] font-bold text-rose-500 bg-white/90 dark:bg-slate-900/90 px-1 rounded">
              20%
            </span>
          </div>

          {/* 50% Marking */}
          <div
            className="absolute inset-x-0 border-t border-dotted border-slate-300 dark:border-slate-600 z-10 pointer-events-none"
            style={{ bottom: '50%' }}
          />

          {/* Liquid level fill with vibrant gradient */}
          <div
            className={`w-full rounded-xl bg-gradient-to-t ${liquidGradient} transition-all duration-500 relative shadow-sm`}
            style={{ height: `${percentage}%` }}
          >
            {/* Top liquid glowing meniscus */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Telemetry Details */}
        <div className="flex-1 flex flex-col justify-between h-40">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Remplissage
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`font-title text-3xl font-black tracking-tight ${
                isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
              }`}>
                {percentage.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* Volumes & Sensors */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Actuel :</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{currentLiters.toLocaleString()} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Capacité :</span>
              <span className="font-medium text-slate-600 dark:text-slate-300 font-mono">{maxCapacity.toLocaleString()} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-cyan-500" />
                <span>Temp. :</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{temperature} °C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational State Label */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Statut bac :</span>
        <span className={`font-bold flex items-center gap-1 ${
          isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
        }`}>
          {isCritical ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critique (Réappro)</span>
            </>
          ) : isWarning ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Vigilance Seuil</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nominal Opérationnel</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default TankGauge;
