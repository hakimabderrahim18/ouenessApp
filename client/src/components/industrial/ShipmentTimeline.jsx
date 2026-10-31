import React from 'react';
import { Check, Clock, AlertTriangle, Truck } from 'lucide-react';

/**
 * Modern High-Impact Shipment Lifecycle Stepper (Frise de Convoi Hydrocarbures)
 * Order -> ADR Validation -> Loading -> Road Transit -> Unloading -> Audit Closure
 */
export const ShipmentTimeline = ({
  shipmentRef = 'BL-2026-0042',
  currentStep = 3, // 1 to 6
  isDelayed = false,
  eta = '2026-10-29 18:30:00',
  events = [
    { label: 'Ordre de Mission', time: '06:15 [UTC+1]', location: 'WH-HMD-01' },
    { label: 'Conformité ADR & Scellés', time: '07:30 [UTC+1]', location: 'Quai N°3' },
    { label: 'Départ Convoi Routier', time: '08:00 [UTC+1]', location: 'Axe RN3 Sud' },
    { label: 'Contrôle Halte Ghardaïa', time: '13:45 [UTC+1]', location: 'Halte RN3' },
    { label: 'Arrivée & Dépotage', time: '18:30 (Est.)', location: 'WH-ALG-04' },
    { label: 'Clôture & Registre Audit', time: 'En attente', location: 'Terminal' },
  ],
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm text-start select-none w-full min-w-0 max-w-full">
      {/* Header with Tracking Reference & ETA Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-title font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                Cycle Convoi : {shipmentRef}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                Gasoil 10PPM (38 450 L)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">Axe Trans-Sahara RN3 // Alger Sidi Arcine</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">ETA Arrivée :</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {eta}
          </span>
          {isDelayed ? (
            <span className="px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Retard (+45 min)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ● Dans les délais
            </span>
          )}
        </div>
      </div>

      {/* Stepper Horizontal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {events.map((evt, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div
              key={index}
              className={`
                p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all duration-200
                ${isCurrent
                  ? isDelayed
                    ? 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/30 shadow-md ring-2 ring-rose-500/20'
                    : 'border-cyan-400 bg-cyan-50/60 dark:bg-cyan-950/30 shadow-md ring-2 ring-cyan-500/20'
                  : isCompleted
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-60'
                }
              `}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  0{stepNumber}.
                </span>
                {isCompleted ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm animate-pulse ${
                    isDelayed ? 'bg-rose-500 shadow-rose-500/50' : 'bg-cyan-500 shadow-cyan-500/50'
                  }`}>
                    ●
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center text-xs">
                    ○
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="font-title font-bold text-xs text-slate-900 dark:text-white leading-tight mb-2">
                {evt.label}
              </div>

              {/* Timestamp & Location */}
              <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {evt.time}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {evt.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentTimeline;
