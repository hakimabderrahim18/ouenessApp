import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  FileSpreadsheet,
  Receipt,
  Truck,
  Globe,
  Building,
} from 'lucide-react';

const Documents = () => {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState('');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const [docRes, shpRes] = await Promise.all([
        api.get('/documents'),
        api.get('/shipments'),
      ]);
      if (docRes.data?.success) setDocuments(docRes.data.data);
      if (shpRes.data?.success) {
        setShipments(shpRes.data.data);
        if (shpRes.data.data.length > 0) {
          setSelectedShipmentId(shpRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleGeneratePDF = async (docType) => {
    try {
      setGenerating(true);
      const res = await api.post(
        '/documents/generate',
        {
          type: docType,
          shipmentId: selectedShipmentId || null,
          language: i18n.language,
        },
        { responseType: 'blob' }
      );

      // Create download link for blob PDF
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${docType}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      fetchDocs();
    } catch (err) {
      alert('حدث خطأ أثناء توليد وثيقة PDF الرسمية.');
    } finally {
      setGenerating(false);
    }
  };

  const templates = [
    {
      type: 'DELIVERY_NOTE',
      title: 'وصل تسليم وشحن محروقات (Bon de Livraison)',
      subtitle: 'وثيقة رسمية مرافقة للصهريج متوافقة مع متطلبات النقل الطرقي ADR',
      icon: Truck,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500',
    },
    {
      type: 'INVOICE',
      title: 'فاتورة تجارية لوجستية (Facture Commerciale)',
      subtitle: 'فاتورة رسمية لحساب تكلفة الشحن والوقود والخدمات اللوجستية',
      icon: Receipt,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      btnColor: 'bg-blue-600 hover:bg-blue-500',
    },
    {
      type: 'RECEIPT_PV',
      title: 'محضر إيداع واستلام (PV de Réception)',
      subtitle: 'محضر قانوني يثبت مطابقة الكميات المستلمة وسلامة الأختام والحرارة',
      icon: Shield,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500',
    },
    {
      type: 'INVENTORY_REPORT',
      title: 'تقرير الجرد العام للمخزون (Rapport d\'Inventaire)',
      subtitle: 'كشف شامل بالأرصدة المتوفرة وحدود الأمان في كافة مستودعات الوطن',
      icon: FileSpreadsheet,
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      btnColor: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      type: 'TRANSPORT_ORDER',
      title: 'أمر نقل وتوزيع رسمي (Ordre de Mission ADR)',
      subtitle: 'أمر تحرك صهريج محروقات وتحديد مسار ومسؤولية السائق',
      icon: FileText,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      btnColor: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      type: 'PACKING_LIST',
      title: 'قائمة الشحن والتعبئة (International Packing List)',
      subtitle: 'نموذج موحد للتجارة الدولية والمبادلات اللوجستية الحدودية',
      icon: Globe,
      color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      btnColor: 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600',
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">{t('nav.documents')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إصدار الوثائق الرسمية والتقارير التنظيمية بصيغة PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            الشحنة:
          </label>
          <select
            value={selectedShipmentId}
            onChange={(e) => setSelectedShipmentId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:border-brand-500"
          >
            {shipments.map((s) => (
              <option key={s._id} value={s._id}>
                {s.reference} ({s.destination?.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Signatories Notice */}
      <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <span>
            كافة الوثائق المولدة معتمدة رسمياً ومختومة من: <strong>المدير العام: RAHMOUNI OUNES</strong> و{' '}
            <strong>مدير العمليات: GOURRARI YOUCEF</strong>.
          </span>
        </div>
        <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">Conforme ADR 2026</span>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.type}
              className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${tpl.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {tpl.subtitle}
                </p>
              </div>

              <button
                disabled={generating}
                onClick={() => handleGeneratePDF(tpl.type)}
                className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${tpl.btnColor}`}
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>توليد وتحميل وثيقة PDF</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Previously Generated Documents Archive */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white flex items-center justify-between">
          <span>أرشيف الوثائق الرسمية المصدرة حديثاً (Recent PDF Ledger)</span>
          <span className="text-xs text-slate-400 font-mono">سجل غير قابل للتعديل</span>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">لا توجد وثائق محفوظة حتى الآن.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-6 font-bold">تاريخ التوليد</th>
                  <th className="py-3 px-4 font-bold">الرقم المرجعي (Ref)</th>
                  <th className="py-3 px-4 font-bold">نوع الوثيقة</th>
                  <th className="py-3 px-4 font-bold">المصدر / المنفذ</th>
                  <th className="py-3 px-6 font-bold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                    <td className="py-3 px-6 font-mono whitespace-nowrap">
                      {new Date(doc.timestamp).toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {doc.documentNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {doc.title?.ar || doc.type}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {doc.generatedBy?.fullName?.ar || 'المسؤول المعتمد'}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handleGeneratePDF(doc.type)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="إعادة تحميل النسخة الرسمية"
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
    </div>
  );
};

export default Documents;
