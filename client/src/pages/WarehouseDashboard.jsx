import React, { useState } from 'react';
import { Scale, QrCode, CheckCircle2, AlertOctagon, FileText, ArrowDownRight, Droplet, Thermometer } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge, AdrDiamond } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const WarehouseDashboard = () => {
  const [selectedTruck, setSelectedTruck] = useState('00421-120-30');
  const [tareKg, setTareKg] = useState('14200');
  const [grossKg, setGrossKg] = useState('46310');
  const [tempC, setTempC] = useState('21.6');
  const [sealCode, setSealCode] = useState('DZ-SCL-98124');
  const [sealStatus, setSealStatus] = useState('VERIFIED');
  const [pvGenerated, setPvGenerated] = useState(false);

  // Computations
  const netKg = Math.max(0, (parseFloat(grossKg) || 0) - (parseFloat(tareKg) || 0));
  // Gasoil density ~0.835 kg/L at 20°C
  const calculatedLiters = Math.round(netKg / 0.835);
  const theoreticalLiters = 38450;
  const varianceLiters = calculatedLiters - theoreticalLiters;

  const handleValidateUnloading = (e) => {
    e.preventDefault();
    setPvGenerated(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6 text-start font-sans antialiased w-full min-w-0 max-w-full overflow-hidden">
      {/* Station Context Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-cyan-600/20 shrink-0">
            W4
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-title font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                Poste de Chargement & Quai // Dépôt Sidi Arcine
              </h2>
              <span className="bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded-full text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                WH-ALG-04
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Responsable d'Exploitation : BOUCHAIB Amine (Matricule : DZ-2026-WH04)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-end">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Pont-Bascule Numérique N°1</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Calibration ONML</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bay Pesée + Unloading Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch min-w-0">
        {/* Left Column (7 Cols): Pesée Pont-Bascule & Camions en Approche */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-w-0 max-w-full">
          <div className="min-w-0">
            <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Scale className="w-4 h-4 text-cyan-500 shrink-0" />
                <h3 className="font-title font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  Registre des Pesées // Barrière d'Entrée & Quai
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Unité : kg</span>
            </div>

            <Table>
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Type Véhicule</TableHead>
                  <TableHead>Cargaison</TableHead>
                  <TableHead align="end">Tare [kg]</TableHead>
                  <TableHead align="end">Brut [kg]</TableHead>
                  <TableHead align="end">Net [kg]</TableHead>
                  <TableHead align="center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow selected={selectedTruck === '00421-120-30'}>
                  <TableCell mono className="font-bold text-cyan-600 dark:text-cyan-400">00421-120-30</TableCell>
                  <TableCell className="text-xs">Mercedes Actros 3340</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium">Gasoil 10PPM</span>
                  </TableCell>
                  <TableCell mono align="end" className="text-slate-400">14 200</TableCell>
                  <TableCell mono align="end" className="font-bold">46 310</TableCell>
                  <TableCell mono align="end" className="font-bold text-cyan-600 dark:text-cyan-400">32 110</TableCell>
                  <TableCell align="center">
                    <button
                      onClick={() => { setSelectedTruck('00421-120-30'); setTareKg('14200'); setGrossKg('46310'); }}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Sélectionner
                    </button>
                  </TableCell>
                </TableRow>

                <TableRow selected={selectedTruck === '01892-122-16'}>
                  <TableCell mono className="font-bold text-cyan-600 dark:text-cyan-400">01892-122-16</TableCell>
                  <TableCell className="text-xs">Renault Trucks K440</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium">Sans Plomb 95</span>
                  </TableCell>
                  <TableCell mono align="end" className="text-slate-400">13 950</TableCell>
                  <TableCell mono align="end" className="font-bold">43 010</TableCell>
                  <TableCell mono align="end" className="font-bold text-cyan-600 dark:text-cyan-400">29 060</TableCell>
                  <TableCell align="center">
                    <button
                      onClick={() => { setSelectedTruck('01892-122-16'); setTareKg('13950'); setGrossKg('43010'); }}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Sélectionner
                    </button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between font-medium">
            <span>Tolérance Ponts-Bascules Alger : ± 0.05%</span>
            <span className="text-emerald-500 font-bold">Capteurs Numériques Synchronisés</span>
          </div>
        </div>

        {/* Right Column (5 Cols): Dépotage Contradictoire & Validation Scellés */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-w-0 max-w-full">
          <div>
            <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-title font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Jaugeage & Dépotage Contradictoire
              </h3>
              <AdrDiamond classType="3" label="CL.3" subtext="" className="scale-75" />
            </div>

            <form onSubmit={handleValidateUnloading} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Input
                  label="Tare Citerne"
                  unit="kg"
                  value={tareKg}
                  onChange={(e) => setTareKg(e.target.value)}
                />
                <Input
                  label="Poids Brut Constaté"
                  unit="kg"
                  value={grossKg}
                  onChange={(e) => setGrossKg(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Input
                  label="Température Liquide"
                  unit="°C"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                />
                <Input
                  label="Scellé Sécurité Vanne"
                  value={sealCode}
                  onChange={(e) => setSealCode(e.target.value)}
                />
              </div>

              {/* Rapprochement Mathématique des Volumes */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Poids Net Hydrocarbure :</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{netKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Volume Déduit (Densité 0.835) :</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">{calculatedLiters.toLocaleString()} Litres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Volume Déclaré sur BL :</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{theoreticalLiters.toLocaleString()} Litres</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Écart Volumétrique :</span>
                  <span className={`font-bold font-mono ${Math.abs(varianceLiters) < 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {varianceLiters > 0 ? `+${varianceLiters}` : varianceLiters} Litres ({((varianceLiters / theoreticalLiters) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={FileText}
                >
                  Valider Dépotage & Émettre PV Officiel
                </Button>
              </div>
            </form>
          </div>

          {/* Success Confirmation Banner */}
          {pvGenerated && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <div>
                <div className="font-bold">PV DE DÉPOTAGE #PV-2026-0814 ÉMIS AVEC SUCCÈS</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Stock du bac TK-ALG-G01 incrémenté de {calculatedLiters.toLocaleString()} L. Données scellées dans le registre d'audit immuable.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
