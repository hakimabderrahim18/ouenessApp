import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Modern High-Impact Hazard / Critical Alert Banner
 * Vibrant safety border, glowing alert badge, clear call to action.
 */
export const HazardBanner = ({
  code = 'ALERTE-VOL-CRIT-04',
  depot = 'WH-ALG-04 (SIDI ARCINE / ALGER)',
  product = 'GASOIL 10 PPM',
  level = '14.8 %',
  autonomy = '< 32 HEURES',
  actionLabel = 'DÉCLENCHER RÉÉQUILIBRAGE ARZEW → ALGER',
  onAction,
  dismissable = false,
  onDismiss,
}) => {
  return (
    <div className="relative overflow-hidden border border-amber-500/30 dark:border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900/40 rounded-2xl p-4 sm:p-5 text-start select-none shadow-md backdrop-blur-md">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                Seuil Critique d'Approvisionnement
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                REF: {code}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Autonomie : {autonomy}
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-0.5">
              Dépôt : <span className="underline decoration-amber-500 decoration-2">{depot}</span> — Stock de {product} à <span className="text-rose-600 dark:text-rose-400 font-black">{level}</span> de la capacité nominale
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Risque de rupture de stock sur le corridor Centre (Alger-Blida). Dérivation prioritaire recommandée depuis la raffinerie d'Arzew via l'Autoroute A1.
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
          {actionLabel && (
            <Button
              variant="safety"
              size="md"
              onClick={onAction}
              icon={ArrowRight}
              iconPosition="end"
            >
              {actionLabel}
            </Button>
          )}

          {dismissable && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Ignorer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HazardBanner;
