import React, { useState } from 'react';
import api from '../../api/axios';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';

const StockMovementModal = ({ product, warehouses, onClose, onSuccess }) => {
  const [type, setType] = useState('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [reason, setReason] = useState('');
  const [documentReference, setDocumentReference] = useState(`BL-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const numQty = Number(quantity) || 0;
  const currentQty = product?.quantity || 0;

  let projectedQty = currentQty;
  if (type === 'ENTRY') projectedQty = currentQty + numQty;
  else if (type === 'EXIT' || type === 'TRANSFER') projectedQty = Math.max(0, currentQty - numQty);
  else if (type === 'ADJUSTMENT') projectedQty = numQty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (numQty <= 0) {
      setError('يرجى إدخال كمية صحيحة أكبر من الصفر.');
      return;
    }

    if ((type === 'EXIT' || type === 'TRANSFER') && numQty > currentQty) {
      setError(`الكمية المطلوبة (${numQty}) تتجاوز الرصيد المتوفر في المخزون (${currentQty}).`);
      return;
    }

    if (type === 'TRANSFER' && !destinationWarehouseId) {
      setError('يرجى تحديد المستودع الوجهة لإتمام عملية التحويل.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        productId: product._id,
        quantity: numQty,
        sourceWarehouseId: product.warehouse?._id || product.warehouse,
        destinationWarehouseId: type === 'TRANSFER' ? destinationWarehouseId : null,
        reason,
        documentReference,
        notes,
      };

      const res = await api.post('/inventory/movements', payload);
      if (res.data?.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message?.ar ||
        err.message ||
        'حدث خطأ أثناء تسجيل حركة المخزون.'
      );
    } finally {
      setLoading(false);
    }
  };

  const typesConfig = [
    { id: 'ENTRY', label: 'إدخال مخزون (Entrée)', icon: ArrowDownLeft, color: 'text-emerald-500 border-emerald-500 bg-emerald-500/10' },
    { id: 'EXIT', label: 'إخراج / توزيع (Sortie)', icon: ArrowUpRight, color: 'text-amber-500 border-amber-500 bg-amber-500/10' },
    { id: 'TRANSFER', label: 'تحويل بين مستودعين (Transfert)', icon: ArrowLeftRight, color: 'text-blue-500 border-blue-500 bg-blue-500/10' },
    { id: 'ADJUSTMENT', label: 'تسوية وجرد (Régularisation)', icon: Settings, color: 'text-purple-500 border-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-start my-8">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
          تسجيل حركة مخزون جديدة (Stock Movement)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          توثيق عمليات الإدخال والإخراج والتحويل بين مستودعات الطاقة وتوليد الطابع الزمني
        </p>

        {/* Product summary pill */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {product.name?.ar}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</div>
          </div>
          <div className="text-end">
            <span className="text-xs text-slate-400">الرصيد الحالي:</span>
            <div className="text-base font-black font-mono text-brand-600 dark:text-brand-400">
              {product.quantity?.toLocaleString()} {product.unit}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Movement Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              نوع العملية اللوجستية *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typesConfig.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${t.color} shadow-sm ring-2 ring-brand-500/30`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Document Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الكمية ({product.unit}) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                رقم الوثيقة / السند المرجعي (BL / PV)
              </label>
              <input
                type="text"
                value={documentReference}
                onChange={(e) => setDocumentReference(e.target.value)}
                placeholder="BL-2026-XXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-brand-500 uppercase"
              />
            </div>
          </div>

          {/* Destination Warehouse (if transfer) */}
          {type === 'TRANSFER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                المستودع الوجهة للتحويل *
              </label>
              <select
                required
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">اختر المستودع الوجهة</option>
                {warehouses
                  .filter((w) => w._id !== (product.warehouse?._id || product.warehouse))
                  .map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name?.ar} ({w.city})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Reason / Operational notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              مبرر العملية / ملاحظات الجرد
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: تموين محطات التوزيع الجنوبية، تفريغ صهريج باخرة..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Live Projection Preview */}
          <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">الرصيد المتوقع بعد التنفيذ:</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-slate-400 line-through">{currentQty.toLocaleString()}</span>
              <span className="text-brand-600 dark:text-brand-400 text-sm">→ {projectedQty.toLocaleString()} {product.unit}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2"
            >
              {loading ? 'جاري التسجيل...' : 'تأكيد العملية وتسجيل الطابع الزمني'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;
