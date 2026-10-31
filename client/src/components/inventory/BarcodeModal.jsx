import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { QrCode, Barcode, Printer, X, Download } from 'lucide-react';

const BarcodeModal = ({ product, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    const fetchCodes = async () => {
      try {
        setLoading(true);
        const [qrRes, barRes] = await Promise.all([
          api.get(`/inventory/products/${product._id}/qrcode`),
          api.get(`/inventory/products/${product._id}/barcode`),
        ]);
        if (qrRes.data?.success) setQrCodeUrl(qrRes.data.qrDataUrl);
        if (barRes.data?.success) setBarcodeUrl(barRes.data.barcodeDataUrl);
      } catch (err) {
        console.error('Failed to fetch product codes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, [product]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-center print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="text-start">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              بطاقة المعاينة والتعريف الرقمية (QR & Barcode)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Container */}
        <div className="py-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
              LogiNaft Smart Product Tag
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {product.name?.ar}
            </h4>
            <div className="text-xs text-slate-500 font-mono">{product.name?.fr}</div>
          </div>

          {loading ? (
            <div className="py-12 text-slate-400">جاري إنشاء رموز الباركود و QR...</div>
          ) : (
            <div className="space-y-6">
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="inline-block p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
                  <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                  <span className="block text-[11px] font-mono text-slate-500 mt-2 font-bold">
                    Scan for Live Logistics & Stock Lookup
                  </span>
                </div>
              )}

              {/* Barcode */}
              {barcodeUrl && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block max-w-full">
                  <img src={barcodeUrl} alt="Barcode 128" className="h-16 mx-auto" />
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>SKU: {product.sku} | Unit: {product.unit}</div>
            <div>Depot: {product.warehouse?.name?.ar || 'المستودع الرئيسي'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملصق (Print Tag)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
