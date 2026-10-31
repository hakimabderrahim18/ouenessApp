import React, { useState } from 'react';
import { Truck, Navigation, AlertTriangle, ShieldAlert, CheckCircle, Clock, Fuel, Radio, Gauge } from 'lucide-react';
import { AdrDiamond } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DriverMobile = () => {
  const [currentStep, setCurrentStep] = useState(2); // 1: Départ, 2: Transit, 3: Arrivée
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [logTime, setLogTime] = useState(null);

  const handleStepValidation = (step) => {
    setCurrentStep(step);
    setLogTime(new Date().toLocaleTimeString('fr-DZ', { timeZone: 'Africa/Algiers' }));
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-5 text-start font-sans antialiased select-none w-full min-w-0 max-w-full overflow-hidden">
      {/* High Visibility Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/30 shrink-0">
            ADR
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold truncate">
              Terminal en Cabine // Chauffeur Poids Lourd
            </div>
            <div className="font-title font-black text-xs sm:text-base text-slate-900 dark:text-white uppercase truncate">
              MUSTAPHA KHELIFI [DZ-2026-DR01]
            </div>
          </div>
        </div>

        <AdrDiamond classType="3" label="CLASSE 3" subtext="" className="scale-75 sm:scale-90 shrink-0" />
      </div>

      {/* In-Cab Mission Data Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-3.5 text-xs min-w-0">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-medium uppercase text-[11px]">Mission Active :</span>
          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm">#OM-2026-0042</span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracteur & Citerne</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm truncate block">00421-120-30</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cargaison</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm truncate block">Gasoil (38 450 L)</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Itinéraire</span>
            <span className="font-bold text-slate-900 dark:text-white truncate block">Hassi Messaoud → Alger</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Corridor Routier</span>
            <span className="font-bold text-orange-500 font-mono truncate block">RN3 Trans-Sahara</span>
          </div>
        </div>

        {/* Telemetry live status strip */}
        <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between text-cyan-900 dark:text-cyan-200 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 shrink-0" />
            <span className="font-medium text-xs sm:text-sm truncate">Vitesse GPS : <strong className="font-mono text-xs sm:text-base font-bold">74 km/h</strong></span>
          </div>
          <div className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 shrink-0">
            Max : 80 km/h
          </div>
        </div>
      </div>

      {/* Large Sequential Action Buttons for Touch */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between ps-1">
          <span>Progression de la Mission :</span>
          {logTime && (
            <span className="text-emerald-500 font-mono text-xs">
              Horodaté : {logTime} [UTC+1]
            </span>
          )}
        </div>

        {/* Step 1 Button */}
        <button
          type="button"
          onClick={() => handleStepValidation(1)}
          className={`w-full p-4 rounded-2xl border text-start transition-all flex items-center justify-between ${
            currentStep >= 1
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          }`}
        >
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Étape 01 // Validée</div>
            <div className="font-title font-bold text-sm text-slate-900 dark:text-white">
              Départ Terminal de Chargement (Hassi Messaoud)
            </div>
          </div>
          {currentStep >= 1 ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Clock className="w-5 h-5" />}
        </button>

        {/* Step 2 Button */}
        <button
          type="button"
          onClick={() => handleStepValidation(2)}
          className={`w-full p-4 rounded-2xl border text-start transition-all flex items-center justify-between ${
            currentStep === 2
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/25 ring-2 ring-cyan-400/30'
              : currentStep > 2
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          }`}
        >
          <div>
            <div className="text-[10px] font-bold uppercase opacity-80">Étape 02 // En Cours</div>
            <div className="font-title font-bold text-sm">
              Halte Contrôle Intermédiaire (Ghardaïa - RN3)
            </div>
            <div className="text-xs opacity-80 mt-0.5">Vérification pression pneus et étanchéité vannes</div>
          </div>
          {currentStep > 2 ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Navigation className="w-5 h-5 text-white animate-pulse" />}
        </button>

        {/* Step 3 Button */}
        <button
          type="button"
          onClick={() => handleStepValidation(3)}
          className={`w-full p-4 rounded-2xl border text-start transition-all flex items-center justify-between ${
            currentStep === 3
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/25'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          }`}
        >
          <div>
            <div className="text-[10px] font-bold uppercase opacity-80">Étape 03 // Arrivée</div>
            <div className="font-title font-bold text-sm">
              Signaler Arrivée Site de Dépotage (Alger)
            </div>
            <div className="text-xs opacity-80 mt-0.5">Enclenche la procédure de pesée pont-bascule</div>
          </div>
          <CheckCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Emergency Road Hazard / ADR Incident Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setEmergencyActive(!emergencyActive)}
          className="w-full h-14 bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-title text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 px-3 shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
        >
          <ShieldAlert className="w-5 h-5 animate-pulse shrink-0" />
          <span className="truncate">Signaler Aléa Routier / Incident ADR</span>
        </button>

        {emergencyActive && (
          <div className="mt-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            <div className="font-bold uppercase">Alerte d'Urgence Transmise au Dispatching Central</div>
            <div className="text-slate-600 dark:text-slate-300 mt-1">
              Position GPS [34.5000°N, 4.5000°E] transmise aux équipes de secours et à la Direction des Opérations (GOURRARI Youcef).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverMobile;
