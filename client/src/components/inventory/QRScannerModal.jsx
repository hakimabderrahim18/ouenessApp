import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../api/axios';
import { Scan, X, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';

const QRScannerModal = ({ onProductFound, onClose }) => {
  const [scanResult, setScanResult] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText) => {
      // Pause scanner while fetching product
      try {
        scanner.pause();
      } catch (e) {}

      let lookupCode = decodedText;
      // Handle if scanned text is JSON format
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.sku) lookupCode = parsed.sku;
      } catch (e) {
        // Plain string
      }

      setScanResult(lookupCode);
      setLoadingProduct(true);
      setErrorMsg(null);

      try {
        const res = await api.get(`/inventory/products/lookup/${encodeURIComponent(lookupCode)}`);
        if (res.data?.success && res.data.data) {
          onProductFound(res.data.data);
          onClose();
        }
      } catch (err) {
        setErrorMsg(
          err.response?.data?.message?.ar ||
          `لم يتم العثور على منتج يطابق الرمز: ${lookupCode}`
        );
        try {
          scanner.resume();
        } catch (e) {}
      } finally {
        setLoadingProduct(false);
      }
    };

    const onScanFailure = (error) => {
      // Non-critical scan failure (frame skipped)
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      try {
        scanner.clear();
      } catch (e) {
        console.warn('Scanner clear error', e);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              ماسح QR والباركود الذكي (Camera Scanner)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          وجّه كاميرا الجهاز نحو رمز QR أو الباركود على صهريج الوقود أو الطرد للتعرف الفوري
        </p>

        {/* Viewfinder container */}
        <div
          id="qr-reader-container"
          className="overflow-hidden rounded-2xl border-2 border-dashed border-brand-500/40 bg-slate-950 text-white min-h-[280px]"
        ></div>

        {loadingProduct && (
          <div className="mt-4 p-3 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-500 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>جاري استرجاع بيانات المنتج ورصيد المخزون...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 text-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Manual lookup fallback */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>دقة المسح: عالية (ADR Code128 / QR)</span>
          <button
            onClick={onClose}
            className="text-brand-500 hover:underline font-bold"
          >
            إغلاق الكاميرا
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
