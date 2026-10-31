import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  X,
  Fuel,
} from 'lucide-react';

const Shipments = () => {
  const { t, i18n } = useTranslation();
  const { hasPermission } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Create form state
  const [form, setForm] = useState({
    originWarehouseId: '',
    destName: '',
    destCity: 'Alger',
    destLat: 36.75,
    destLng: 3.05,
    truckId: '',
    driverId: '',
    productId: '',
    quantity: 30000,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const [shpRes, whRes, trkRes, usrRes, prodRes] = await Promise.all([
        api.get('/shipments', { params }),
        api.get('/inventory/warehouses'),
        api.get('/fleet'),
        api.get('/users'),
        api.get('/inventory/products'),
      ]);

      if (shpRes.data?.success) setShipments(shpRes.data.data);
      if (whRes.data?.success) {
        setWarehouses(whRes.data.data);
        if (whRes.data.data.length > 0 && !form.originWarehouseId) {
          setForm((prev) => ({ ...prev, originWarehouseId: whRes.data.data[0]._id }));
        }
      }
      if (trkRes.data?.success) setTrucks(trkRes.data.data);
      if (usrRes.data?.success) {
        setDrivers(usrRes.data.data.filter((u) => u.role?.name === 'DRIVER' || u.status === 'active'));
      }
      if (prodRes.data?.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        originWarehouseId: form.originWarehouseId,
        destination: {
          name: form.destName || `مركز توزيع ${form.destCity}`,
          city: form.destCity,
          location: { lat: Number(form.destLat), lng: Number(form.destLng) },
        },
        truckId: form.truckId || trucks[0]?._id,
        driverId: form.driverId || drivers[0]?._id,
        products: [
          {
            product: form.productId || products[0]?._id,
            quantity: Number(form.quantity),
            unit: 'liter',
          },
        ],
      };

      const res = await api.post('/shipments', payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message?.ar ||
        err.message ||
        'حدث خطأ أثناء إنشاء أمر الشحنة.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      await api.put(`/shipments/${shipmentId}/status`, { status: newStatus });
      fetchData();
      if (selectedShipment && selectedShipment._id === shipmentId) {
        setSelectedShipment(null);
      }
    } catch (err) {
      alert(err.response?.data?.message?.ar || 'فشل تحديث حالة الشحنة');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_TRANSIT':
        return { label: 'في الطريق (In Transit)', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' };
      case 'DELAYED':
        return { label: 'متأخرة عن الموعد (Delayed)', color: 'bg-red-500/15 text-red-500 border-red-500/30 animate-pulse' };
      case 'ARRIVED':
        return { label: 'تم التسليم (Arrived)', color: 'bg-blue-500/15 text-blue-500 border-blue-500/30' };
      case 'LOADING':
        return { label: 'جاري الشحن والتعبئة', color: 'bg-purple-500/15 text-purple-500 border-purple-500/30' };
      default:
        return { label: 'قيد الانتظار (Pending)', color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' };
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">{t('nav.shipments')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة وتوجيه شحنات الطاقة، إصدار أوامر النقل، والتحكم في دورة حياة الشحنة
          </p>
        </div>

        {hasPermission('shipments:create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء شحنة جديدة</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الشحنة، الوجهة، السائق..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع الحالات</option>
            <option value="IN_TRANSIT">في الطريق (In Transit)</option>
            <option value="DELAYED">متأخرة (Delayed)</option>
            <option value="ARRIVED">تم التسليم (Arrived)</option>
            <option value="PENDING">قيد الانتظار (Pending)</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            جاري استرجاع أوامر الشحن والتوزيع...
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد شحنات مطابقة لمعايير البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6 font-bold">الرقم المرجعي (Ref)</th>
                  <th className="py-4 px-4 font-bold">نقطة الانطلاق → الوجهة</th>
                  <th className="py-4 px-4 font-bold">الحمولة والمنتج</th>
                  <th className="py-4 px-4 font-bold">الشاحنة والسائق</th>
                  <th className="py-4 px-4 font-bold">الحالة والموعد (ETA)</th>
                  <th className="py-4 px-6 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {shipments.map((shp) => {
                  const badge = getStatusBadge(shp.status);
                  const isDelayed = shp.status === 'DELAYED';

                  return (
                    <tr key={shp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-black font-mono text-sm text-slate-900 dark:text-white">
                          {shp.reference}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(shp.createdAt).toLocaleDateString('ar-DZ')}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {shp.originWarehouse?.name?.ar}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                          <ArrowRight className="w-3 h-3 text-brand-500" />
                          <span>إلى: <strong>{shp.destination?.name} ({shp.destination?.city})</strong></span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {shp.products?.map((p, idx) => (
                          <div key={idx} className="font-bold text-slate-900 dark:text-white">
                            {p.quantity?.toLocaleString()} {p.unit} ({p.product?.name?.ar})
                          </div>
                        ))}
                        <div className="text-[10px] text-slate-400">
                          المسافة: {shp.optimizedRoute?.distanceKm || 0} كم
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {shp.truck?.plateNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {shp.driver?.fullName?.ar || 'سائق معتمد'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          ETA: {new Date(shp.estimatedArrivalTime).toLocaleTimeString('fr-DZ', { timeZone: 'Africa/Algiers', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {shp.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(shp._id, 'IN_TRANSIT')}
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              إطلاق الشحنة
                            </button>
                          )}
                          {(shp.status === 'IN_TRANSIT' || shp.status === 'DELAYED') && (
                            <button
                              onClick={() => handleUpdateStatus(shp._id, 'ARRIVED')}
                              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                            >
                              تأكيد التسليم
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedShipment(shp)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-500"
                            title="عرض تفاصيل الشحنة والسجل الزمني"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 my-8 text-start">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
              إصدار أمر شحن ونقل طاقة جديد
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              تحديد مسار الرحلة، الشاحنة الصهريج، السائق، وحمولة المحروقات
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    مستودع أو مصفاة الانطلاق *
                  </label>
                  <select
                    required
                    value={form.originWarehouseId}
                    onChange={(e) => setForm({ ...form, originWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name?.ar} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ولاية / مدينة الوجهة *
                  </label>
                  <select
                    value={form.destCity}
                    onChange={(e) => {
                      const city = e.target.value;
                      let lat = 36.75;
                      let lng = 3.05;
                      if (city === 'Oran') { lat = 35.69; lng = -0.63; }
                      else if (city === 'Tiaret') { lat = 35.37; lng = 1.31; }
                      else if (city === 'Constantine') { lat = 36.36; lng = 6.61; }
                      else if (city === 'Ouargla') { lat = 31.95; lng = 5.32; }
                      setForm({ ...form, destCity: city, destLat: lat, destLng: lng });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Alger">الجزائر العاصمة (Alger)</option>
                    <option value="Oran">وهران (Oran)</option>
                    <option value="Tiaret">تيارت (Tiaret)</option>
                    <option value="Constantine">قسنطينة (Constantine)</option>
                    <option value="Ouargla">ورقلة (Ouargla)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الشاحنة الصهريج المخصصة *
                  </label>
                  <select
                    required
                    value={form.truckId}
                    onChange={(e) => setForm({ ...form, truckId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.plateNumber} ({t.brand} - {t.tankCapacityLiters}L)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    السائق المعتمد *
                  </label>
                  <select
                    required
                    value={form.driverId}
                    onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName?.ar} ({d.professionalId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المنتج الطاقوي *
                  </label>
                  <select
                    required
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name?.ar} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الكمية المشحونة (لتر) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25"
                >
                  {submitting ? 'جاري الحساب والإنشاء...' : 'إصدار أمر الشحنة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Details / Timeline Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-start my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400">Shipment Details</span>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {selectedShipment.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                السجل الزمني لمراحل الشحنة (Daily Timestamp Log)
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-y-0 before:right-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {selectedShipment.statusHistory?.map((item, idx) => (
                  <div key={idx} className="relative pr-6">
                    <div className="absolute right-0.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900"></div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{item.status}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleString('ar-DZ')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
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

export default Shipments;
