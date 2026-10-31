import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BarcodeModal from '../components/inventory/BarcodeModal';
import QRScannerModal from '../components/inventory/QRScannerModal';
import StockMovementModal from '../components/inventory/StockMovementModal';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Scan,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Warehouse as WarehouseIcon,
  Fuel,
  Flame,
  Layers,
  History,
  Tag,
} from 'lucide-react';

const Inventory = () => {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'movements'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  // Modals state
  const [activeBarcodeProduct, setActiveBarcodeProduct] = useState(null);
  const [activeMovementProduct, setActiveMovementProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  // Fetch products & warehouses
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedWarehouse) params.warehouse = selectedWarehouse;

      const [prodRes, whRes, mvtRes] = await Promise.all([
        api.get('/inventory/products', { params }),
        api.get('/inventory/warehouses'),
        api.get('/inventory/movements', { params: { limit: 15 } }),
      ]);

      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (whRes.data?.success) setWarehouses(whRes.data.data);
      if (mvtRes.data?.success) setMovements(mvtRes.data.data);
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedWarehouse]);

  const handleProductScanned = (product) => {
    // When scanned by camera, highlight and open stock movement directly
    setActiveMovementProduct(product);
  };

  const handleMovementSuccess = () => {
    fetchData();
  };

  // Helper for progress bar color
  const getProgressColor = (percentage, quantity, minThreshold) => {
    if (quantity <= minThreshold) return 'bg-red-500';
    if (percentage < 35) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Helper for Category badge
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'fuel':
        return { label: 'محروقات (Fuel)', color: 'bg-orange-500/15 text-orange-500 border-orange-500/30', icon: Fuel };
      case 'gas_cylinders':
        return { label: 'غاز البوتان/البروبان', color: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30', icon: Flame };
      case 'lubricants':
        return { label: 'زيوت وشحوم صناعية', color: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30', icon: Layers };
      default:
        return { label: 'تجهيزات ومعدات', color: 'bg-slate-500/15 text-slate-500 border-slate-500/30', icon: Boxes };
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Top action & header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <Boxes className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">{t('nav.inventory')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة المخزون الطاقوي، مراقبة مستويات الأمان، وتتبع الحركات بالباركود ومسح QR
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Camera Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-md transition-all w-full sm:w-auto"
            title="مسح QR أو باركود المنتج بالكاميرا"
          >
            <Scan className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>مسح QR / Barcode</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Products vs Movements History */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 w-full min-w-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4 shrink-0" />
          <span>أرصدة المنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'movements'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>سجل الحركات ({movements.length})</span>
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم المنتج، رمز SKU..."
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="">جميع المستودعات والمصافي</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name?.ar} ({w.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="">جميع التصنيفات</option>
                <option value="fuel">محروقات (وقود ومازوت وبنزين)</option>
                <option value="gas_cylinders">قارورات الغاز (بوتان وبروبان)</option>
                <option value="lubricants">زيوت وشحوم المحركات</option>
                <option value="equipment">تجهيزات ومعدات تفريغ</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              جاري فحص أرصدة المستودعات والمخزون...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              لا توجد منتجات تطابق معايير البحث الحالية.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => {
                const percentage = product.stockPercentage || 0;
                const isLow = product.quantity <= product.minThreshold;
                const cat = getCategoryBadge(product.category);
                const CatIcon = cat.icon;
                const progressColor = getProgressColor(percentage, product.quantity, product.minThreshold);

                return (
                  <div
                    key={product._id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                      isLow
                        ? 'border-red-400/60 dark:border-red-500/40 ring-1 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{cat.label}</span>
                        </span>

                        {isLow ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500 text-white flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>تنبيه: اقتراب النفاذ</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                            مستوى آمن
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {product.name?.ar}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <WarehouseIcon className="w-3.5 h-3.5 text-brand-500" />
                        <span>{product.warehouse?.name?.ar || 'المستودع المركزي'}</span>
                      </div>

                      {/* Stock Level Gauge & Progress Bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">الكمية المتبقية:</span>
                          <div className="font-mono">
                            <strong className="text-base font-black text-slate-900 dark:text-white">
                              {product.quantity?.toLocaleString()}
                            </strong>{' '}
                            <span className="text-xs text-slate-400">{product.unit}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${Math.max(4, percentage)}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>النسبة: <strong className="font-mono text-slate-700 dark:text-slate-200">{percentage}%</strong></span>
                          <span>حد الأمان: {product.minThreshold?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveBarcodeProduct(product)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold flex items-center gap-1.5"
                        title="عرض وطباعة رمز QR والباركود"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand-500" />
                        <span>QR / Barcode</span>
                      </button>

                      {hasPermission('inventory:create') && (
                        <button
                          onClick={() => setActiveMovementProduct(product)}
                          className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm shadow-brand-500/25 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>حركة مخزون</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Movements History Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white flex items-center justify-between">
            <span>سجل حركات المخزون والإيداع والاستلام (Daily Stock Logs)</span>
            <span className="text-xs font-mono text-slate-400">سجل لحظي موثق بالطابع الزمني</span>
          </div>

          {movements.length === 0 ? (
            <div className="p-12 text-center text-slate-400">لا توجد حركات مخزون مسجلة حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-6 font-bold">التاريخ والتوقيت</th>
                    <th className="py-3 px-4 font-bold">الرقم المرجعي (Ref)</th>
                    <th className="py-3 px-4 font-bold">نوع الحركة</th>
                    <th className="py-3 px-4 font-bold">المنتج</th>
                    <th className="py-3 px-4 font-bold">الكمية</th>
                    <th className="py-3 px-4 font-bold">المستودع المصدر / الوجهة</th>
                    <th className="py-3 px-4 font-bold">المنفذ والسند</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {movements.map((mvt) => (
                    <tr key={mvt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                      <td className="py-3 px-6 font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(mvt.timestamp).toLocaleDateString('ar-DZ')}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-500" />
                          {new Date(mvt.timestamp).toLocaleTimeString('fr-DZ', { timeZone: 'Africa/Algiers' })}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {mvt.reference}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            mvt.type === 'ENTRY'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : mvt.type === 'EXIT'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : mvt.type === 'TRANSFER'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {mvt.type === 'ENTRY'
                            ? 'إدخال مخزون'
                            : mvt.type === 'EXIT'
                            ? 'إخراج وتوزيع'
                            : mvt.type === 'TRANSFER'
                            ? 'تحويل بين مستودعين'
                            : 'تسوية وجرد'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {mvt.product?.name?.ar}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{mvt.product?.sku}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {mvt.quantity?.toLocaleString()} {mvt.product?.unit}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <div>من: {mvt.sourceWarehouse?.name?.ar || 'المستودع'}</div>
                        {mvt.destinationWarehouse && (
                          <div className="text-brand-500">إلى: {mvt.destinationWarehouse?.name?.ar}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {mvt.performedBy?.fullName?.ar || 'المسؤول'}
                        </div>
                        {mvt.documentReference && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            سند: {mvt.documentReference}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Barcode & QR Code Modal */}
      {activeBarcodeProduct && (
        <BarcodeModal
          product={activeBarcodeProduct}
          onClose={() => setActiveBarcodeProduct(null)}
        />
      )}

      {/* Stock Movement Modal */}
      {activeMovementProduct && (
        <StockMovementModal
          product={activeMovementProduct}
          warehouses={warehouses}
          onClose={() => setActiveMovementProduct(null)}
          onSuccess={handleMovementSuccess}
        />
      )}

      {/* Camera QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          onProductFound={handleProductScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Inventory;
