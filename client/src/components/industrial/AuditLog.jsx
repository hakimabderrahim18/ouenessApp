import React, { useState } from 'react';
import { Lock, FileCheck, ArrowRight, Filter, Download } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * Modern High-Impact Audit Log (Registre d'Audit Immuable)
 * Cryptographic hashing, sequential numbering, diff inspector.
 */
export const AuditLog = ({ logs = [] }) => {
  const [selectedLog, setSelectedLog] = useState(null);

  const sampleLogs = [
    {
      seq: '008421',
      timestamp: '2026-10-29 17:15:22 [UTC+1]',
      operator: 'GOURRARI Youcef',
      role: 'Directeur des Opérations',
      matricule: 'DZ-2026-COO',
      ip: '10.0.12.44',
      action: 'STOCK_TRANSFER_ORDER',
      entity: 'TRANSFER: TR-2026-089',
      status: 'VERIFIED',
      hash: 'sha256:7f4a9b2c810d',
      diff: {
        before: { origin: 'WH-ARZ-02', quantityLiters: 120000, status: 'PLANNED' },
        after: { origin: 'WH-ARZ-02', quantityLiters: 120000, status: 'DISPATCHED_TO_ALGER' },
      },
    },
    {
      seq: '008420',
      timestamp: '2026-10-29 16:48:10 [UTC+1]',
      operator: 'SYSTEM_AUTODETECT',
      role: 'Moniteur SCADA GPS',
      matricule: 'SYS-DAEMON-01',
      ip: '127.0.0.1',
      action: 'AUTO_FLAG_DELAYED',
      entity: 'SHIPMENT: SHP-2026-0042',
      status: 'VERIFIED',
      hash: 'sha256:3a8e104f9812',
      diff: {
        before: { eta: '2026-10-29 16:30', status: 'IN_TRANSIT' },
        after: { eta: '2026-10-29 17:15', status: 'DELAYED', delayMinutes: 45 },
      },
    },
    {
      seq: '008419',
      timestamp: '2026-10-29 15:30:05 [UTC+1]',
      operator: 'BOUCHAIB Amine',
      role: 'Chef de Dépôt Alger',
      matricule: 'DZ-2026-WH04',
      ip: '192.168.4.12',
      action: 'TANK_GAUGE_ENTRY',
      entity: 'TANK: BAC-TK-ALG-02',
      status: 'VERIFIED',
      hash: 'sha256:19b4ef3301aa',
      diff: {
        before: { volumeLiters: 74200, tempC: 21.0 },
        after: { volumeLiters: 68150, tempC: 22.1, diffLiters: -6050 },
      },
    },
    {
      seq: '008418',
      timestamp: '2026-10-29 14:12:44 [UTC+1]',
      operator: 'RAHMOUNI Ounes',
      role: 'Directeur Général',
      matricule: 'DZ-2026-GM01',
      ip: '10.0.1.2',
      action: 'SECURITY_AUDIT_APPROVAL',
      entity: 'PERIOD: OCT-2026-W4',
      status: 'VERIFIED',
      hash: 'sha256:aa99411bc023',
      diff: {
        before: { status: 'PENDING_APPROVAL' },
        after: { status: 'CERTIFIED_APPROVED_DG' },
      },
    },
  ];

  const displayLogs = logs.length > 0 ? logs : sampleLogs;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden select-none text-start space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white">
              Registre des Opérations & Piste d'Audit Immuable
            </h3>
            <p className="text-xs text-slate-400">Horodatage Africa/Algiers (UTC+1) // Chaîne Intègre SHA-256</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="success" size="sm">
            Chaîne Cryptographique Vérifiée
          </Badge>
          <Button variant="outline" size="sm" icon={Download}>
            Export Audit
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Table>
        <TableHeader>
          <TableRow isHeader>
            <TableHead>Séq #</TableHead>
            <TableHead>Horodatage [UTC+1]</TableHead>
            <TableHead>Opérateur / Rôle</TableHead>
            <TableHead>Action Système</TableHead>
            <TableHead>Entité Cible</TableHead>
            <TableHead>Hash Cryptographique</TableHead>
            <TableHead align="center">Contrôle Diff</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayLogs.map((log) => (
            <TableRow
              key={log.seq}
              onClick={() => setSelectedLog(selectedLog?.seq === log.seq ? null : log)}
              selected={selectedLog?.seq === log.seq}
            >
              <TableCell mono className="font-bold text-purple-600 dark:text-purple-400">
                #{log.seq}
              </TableCell>
              <TableCell mono className="text-slate-500 dark:text-slate-400 text-xs">{log.timestamp}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white">{log.operator}</span>
                  <span className="text-[11px] text-slate-400">{log.matricule} ({log.role})</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {log.action}
                </span>
              </TableCell>
              <TableCell mono className="text-xs">{log.entity}</TableCell>
              <TableCell mono className="text-slate-400 text-xs">
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{log.hash}</span>
              </TableCell>
              <TableCell align="center">
                <button
                  type="button"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline uppercase"
                >
                  {selectedLog?.seq === log.seq ? 'Masquer' : 'Inspecter'}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diff Inspector Modal/Drawer if a log is selected */}
      {selectedLog && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white">
              Inspection Différentielle — Séquence #{selectedLog.seq} [{selectedLog.action}]
            </span>
            <span className="text-xs text-slate-400">IP Source : {selectedLog.ip}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase mb-1">
                État Antérieur (Avant Modification)
              </div>
              <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                {JSON.stringify(selectedLog.diff.before, null, 2)}
              </pre>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                État Enregistré (Après Transaction)
              </div>
              <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                {JSON.stringify(selectedLog.diff.after, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
