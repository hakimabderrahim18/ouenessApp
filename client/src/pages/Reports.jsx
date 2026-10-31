import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Plus,
  Download,
  Calendar,
  Clock,
  Award,
  Users,
  Zap,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';

const Reports = () => {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'reports'
  const [reports, setReports] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('MONTH'); // 'WEEK' | 'MONTH' | 'YEAR'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rptRes, perfRes] = await Promise.all([
        api.get('/reports'),
        api.get('/users/performance'),
      ]);

      if (rptRes.data?.success) setReports(rptRes.data.data);
      if (perfRes.data?.success) setPerformanceData(perfRes.data.data);
    } catch (err) {
      console.error('Fetch reports / performance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async (freq, type) => {
    try {
      setGenerating(true);
      const res = await api.post('/reports/generate', {
        frequency: freq,
        type: type,
      });

      if (res.data?.success) {
        fetchData();
        setActiveTab('reports');
      }
    } catch (err) {
      alert('حدث خطأ أثناء إنشاء التقرير الذكي.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReportPDF = async (reportId, reportNum) => {
    try {
      const res = await api.get(`/reports/${reportId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('فشل تصدير ملف PDF للتقرير.');
    }
  };

  const employees = performanceData?.employees || [];
  const topPerformer = performanceData?.summary?.topPerformer || employees[0];

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">{t('nav.reports')} (HR & Performance)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تقييم إنتاجية وكفاءة الموظفين، والتقارير الدورية المؤتمتة
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasPermission('reports:create') && (
            <button
              disabled={generating}
              onClick={() => handleGenerateReport('MANUAL', 'INVENTORY_SUMMARY')}
              className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all w-full sm:w-auto"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{generating ? 'جاري التوليد...' : 'تقرير ذكي فوري'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 w-full min-w-0">
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'performance'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>تقييم الكفاءة ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>أرشيف التقارير ({reports.length})</span>
        </button>
      </div>

      {/* Tab 1: Employee Performance Panel */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Top Performer Card & Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Top Performer Highlight */}
            {topPerformer && (
              <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-brand-900 to-indigo-950 border border-brand-500/40 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold border border-amber-500/30 mb-4">
                    <Award className="w-4 h-4" />
                    <span>الموظف الأعلى كفاءة لهذا الشهر (Top Performer)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      {topPerformer.fullName?.ar?.slice(0, 1) || 'م'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {topPerformer.fullName?.ar}
                      </h3>
                      <div className="text-xs text-amber-400 font-mono font-bold">
                        {topPerformer.fullName?.latin}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {topPerformer.jobTitle?.ar || topPerformer.role?.displayName?.ar}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-brand-800/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">معدل الكفاءة:</span>
                      <div className="text-2xl font-black text-amber-400">{topPerformer.performanceScore}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">العمليات المنجزة:</span>
                      <div className="text-2xl font-black text-white">{topPerformer.completedOperationsCount}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-800/60 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>متوسط سرعة الإنجاز: {topPerformer.averageOperationTimeMinutes || 18} دقيقة / مهمة</span>
                  <span className="text-emerald-400 font-bold">أداء متميز</span>
                </div>
              </div>
            )}

            {/* General HR Productivity Stats */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">متوسط كفاءة الفريق اللوجستي</span>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
                    {performanceData?.summary?.averagePerformanceScore || 94}%
                  </div>
                  <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>أعلى من المعدل المستهدف (85%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mt-4">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">إجمالي العمليات التشغيلية المنجزة</span>
                  <div className="text-3xl font-black font-mono text-brand-600 dark:text-brand-400 mt-2">
                    {(performanceData?.summary?.totalCompletedOperations || 5890).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    شحن، تفريغ، تدقيق، وجرد مخازن
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  إجمالي الموظفين النشطين: {employees.length} موظف
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">معايير التقييم والترتيب</span>
                  <span className="text-[11px] text-slate-400 font-mono">Algorithmic Scoring</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  يتم احتساب درجة الكفاءة (Performance Score) آلياً بناءً على: سرعة استكمال أوامر الشحن مقارنة بالزمن المستهدف، نسبة الأخطاء الصفرية في الجرد، والالتزام ببروتوكولات الأمان والسلامة المهنية ADR.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Ranking Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                جدول ترتيب الموظفين حسب الكفاءة والسرعة (Staff Efficiency Ranking)
              </span>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                {['WEEK', 'MONTH', 'YEAR'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      periodFilter === period
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {period === 'WEEK' ? 'أسبوعي' : period === 'MONTH' ? 'شهري' : 'سنوي'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-6 font-bold text-center">الترتيب</th>
                    <th className="py-3 px-4 font-bold">الموظف / الاسم الكامل</th>
                    <th className="py-3 px-4 font-bold">الدور الوظيفي</th>
                    <th className="py-3 px-4 font-bold text-center">العمليات المنجزة</th>
                    <th className="py-3 px-4 font-bold text-center">متوسط سرعة الإنجاز</th>
                    <th className="py-3 px-6 font-bold">درجة الكفاءة العامة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {employees.map((emp, idx) => (
                    <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                      <td className="py-3.5 px-6 text-center font-mono font-black text-sm">
                        {idx === 0 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white flex items-center justify-center mx-auto">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center mx-auto">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400">#{idx + 1}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {emp.fullName?.ar}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {emp.fullName?.latin} | {emp.professionalId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {emp.jobTitle?.ar || emp.role?.displayName?.ar}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-brand-600 dark:text-brand-400">
                        {emp.completedOperationsCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {emp.averageOperationTimeMinutes || 25} دقيقة
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm w-10 text-end">
                            {emp.performanceScore || 85}%
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (emp.performanceScore || 85) >= 95
                                  ? 'bg-amber-500'
                                  : (emp.performanceScore || 85) >= 90
                                  ? 'bg-emerald-500'
                                  : 'bg-brand-500'
                              }`}
                              style={{ width: `${emp.performanceScore || 85}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart Reports Archive */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm text-slate-800 dark:text-white">
            <span>سجل التقارير الذكية المولدة آلياً (Automated Periodic Reports Ledger)</span>
            <span className="text-xs text-slate-400 font-mono">Node-Cron & On-Demand Engine</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">لا توجد تقارير دورية مسجلة بعد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-6 font-bold">تاريخ وتوقيت الإصدار</th>
                    <th className="py-3 px-4 font-bold">الرقم المرجعي (Ref)</th>
                    <th className="py-3 px-4 font-bold">عنوان التقرير والنوع</th>
                    <th className="py-3 px-4 font-bold">الدورية (Frequency)</th>
                    <th className="py-3 px-4 font-bold">الجهة المصدرة</th>
                    <th className="py-3 px-6 font-bold text-center">تحميل PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {reports.map((rpt) => (
                    <tr key={rpt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                      <td className="py-3 px-6 font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(rpt.timestamp).toLocaleDateString('ar-DZ')}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-500" />
                          {new Date(rpt.timestamp).toLocaleTimeString('fr-DZ', { timeZone: 'Africa/Algiers' })}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {rpt.reportNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-white">
                          {rpt.title?.ar || rpt.title?.fr}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{rpt.type}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            rpt.frequency === 'DAILY'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : rpt.frequency === 'WEEKLY'
                              ? 'bg-blue-500/15 text-blue-600'
                              : rpt.frequency === 'MONTHLY'
                              ? 'bg-purple-500/15 text-purple-600'
                              : 'bg-amber-500/15 text-amber-600'
                          }`}
                        >
                          {rpt.frequency === 'DAILY'
                            ? 'تقرير يومي'
                            : rpt.frequency === 'WEEKLY'
                            ? 'تقرير أسبوعي'
                            : rpt.frequency === 'MONTHLY'
                            ? 'تقرير شهري'
                            : 'فوري (Manual)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {rpt.generatedByName}
                      </td>

                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleDownloadReportPDF(rpt._id, rpt.reportNumber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="تحميل التقرير كوثيقة PDF رسمية"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
