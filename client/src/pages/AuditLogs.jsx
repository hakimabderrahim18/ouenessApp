import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  Shield,
  Download,
  Eye,
  CheckCircle2,
  Activity,
  User,
  ArrowRight,
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 25 };
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/audit', { params });
      if (res.data?.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch audit logs failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter, search, startDate, endDate, page]);

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Target ID', 'IP Address', 'Description'];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toLocaleString('fr-DZ', { timeZone: 'Africa/Algiers' }),
      `"${l.performedByName}"`,
      l.userRole,
      l.action,
      l.module,
      l.targetId,
      l.ipAddress,
      `"${l.description?.ar || l.description?.latin || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LogiNaft_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">سجل تدقيق العمليات الزمني (Audit Logs)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            سجل إلكتروني غير قابل للتعديل يوثق كل عملية، منفذها، وتوقيتها
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all w-full sm:w-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>تصدير CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، المعرف، الوصف..."
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع الوحدات (Modules)</option>
            <option value="AUTH">الأمان والدخول (AUTH)</option>
            <option value="USERS">الموظفون (USERS)</option>
            <option value="ROLES">الأدوار (ROLES)</option>
            <option value="INVENTORY">المخزون (INVENTORY)</option>
            <option value="SHIPMENTS">الشحنات (SHIPMENTS)</option>
            <option value="FLEET">الأسطول (FLEET)</option>
            <option value="TRACKING">التتبع (TRACKING)</option>
            <option value="DOCUMENTS">الوثائق (DOCUMENTS)</option>
            <option value="REPORTS">التقارير (REPORTS)</option>
          </select>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع أنواع العمليات</option>
            <option value="LOGIN">تسجيل دخول (LOGIN)</option>
            <option value="LOGOUT">تسجيل خروج (LOGOUT)</option>
            <option value="CREATE">إنشاء جديد (CREATE)</option>
            <option value="UPDATE">تعديل بيانات (UPDATE)</option>
            <option value="DELETE">حذف (DELETE)</option>
            <option value="STOCK_IN">إدخال مخزون (STOCK_IN)</option>
            <option value="STOCK_OUT">إخراج مخزون (STOCK_OUT)</option>
            <option value="SHIPMENT_DISPATCH">انطلاق شحنة</option>
            <option value="SHIPMENT_DELIVERED">تسليم شحنة</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
            title="من تاريخ"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            جاري استرجاع سجلات التدقيق...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد سجلات تطابق الفلاتر المحددة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-6 font-bold">التاريخ والتوقيت (DZ)</th>
                  <th className="py-3.5 px-4 font-bold">المستخدم المنفذ</th>
                  <th className="py-3.5 px-4 font-bold">العملية (Action)</th>
                  <th className="py-3.5 px-4 font-bold">الوحدة (Module)</th>
                  <th className="py-3.5 px-6 font-bold">الوصف والتفاصيل</th>
                  <th className="py-3.5 px-4 font-bold">عنوان IP</th>
                  <th className="py-3.5 px-4 font-bold text-center">التغيير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.map((l) => {
                  const logDate = new Date(l.timestamp);
                  return (
                    <tr key={l._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-6 font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {logDate.toLocaleDateString('ar-DZ')}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-brand-500" />
                          {logDate.toLocaleTimeString('fr-DZ', { timeZone: 'Africa/Algiers' })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {l.performedByName}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono">
                          {l.userRole}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] inline-block ${
                            l.action.includes('CREATE') || l.action.includes('IN')
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : l.action.includes('DELETE')
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : l.action.includes('UPDATE')
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {l.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-slate-600 dark:text-slate-300">
                          {l.module}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-slate-700 dark:text-slate-300">
                        {l.description?.ar || l.description?.fr || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {l.ipAddress}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {l.changes && (l.changes.before || l.changes.after) ? (
                          <button
                            onClick={() => setSelectedLog(l)}
                            className="p-1 text-brand-600 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg"
                            title="عرض التغييرات (Diff)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <span>
              إجمالي السجلات: <strong className="text-slate-800 dark:text-white">{pagination.total}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                السابق
              </button>
              <span className="font-mono">
                {page} / {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Changes Modal (Before & After Inspector) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                تفاصيل التعديل وسجل التغييرات (Diff Inspector)
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div className="font-bold text-red-600 dark:text-red-400 mb-2">الحالة السابقة (Before):</div>
                <pre className="overflow-x-auto whitespace-pre-wrap max-h-64 text-[11px] text-slate-700 dark:text-slate-300">
                  {selectedLog.changes?.before
                    ? JSON.stringify(selectedLog.changes.before, null, 2)
                    : 'لا توجد بيانات سابقة (إنشاء جديد)'}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">الحالة الجديدة (After):</div>
                <pre className="overflow-x-auto whitespace-pre-wrap max-h-64 text-[11px] text-slate-700 dark:text-slate-300">
                  {selectedLog.changes?.after
                    ? JSON.stringify(selectedLog.changes.after, null, 2)
                    : 'تم الحذف'}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
