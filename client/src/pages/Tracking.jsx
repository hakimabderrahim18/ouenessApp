import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import LeafletMap from '../components/tracking/LeafletMap';
import {
  MapPin,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Thermometer,
  Shield,
  Phone,
  Radio,
  Search,
  Filter,
  Navigation,
} from 'lucide-react';

const Tracking = () => {
  const { t, i18n } = useTranslation();
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments');
      if (res.data?.success) {
        setShipments(res.data.data);
        if (res.data.data.length > 0 && !selectedShipment) {
          setSelectedShipment(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch tracking shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter((s) => {
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchRef = s.reference?.toLowerCase().includes(q);
      const matchDest = s.destination?.city?.toLowerCase().includes(q);
      const matchTruck = s.truck?.plateNumber?.toLowerCase().includes(q);
      return matchRef || matchDest || matchTruck;
    }
    return true;
  });

  const activeInTransit = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const delayedCount = shipments.filter((s) => s.status === 'DELAYED').length;

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{t('nav.tracking')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            مراقبة وتتبع حركة أسطول شاحنات صهاريج الطاقة عبر شبكة الطرق والمحاور الوطنية الجزائرية
          </p>
        </div>

        {/* Quick status counts */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>في الطريق: {activeInTransit}</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>متأخرة: {delayedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map View */}
        <div className="lg:col-span-8 space-y-4">
          <LeafletMap
            selectedShipmentId={selectedShipment?._id}
            onSelectShipment={(shp) => setSelectedShipment(shp)}
          />

          {/* Selected Shipment Telemetry Strip */}
          {selectedShipment && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400">السرعة الحالية:</span>
                  <div className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                    {selectedShipment.currentLocation?.speedKmH || 0} كم/ساعة
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400">حرارة الصهريج:</span>
                  <div className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                    {selectedShipment.telemetry?.tankTemperatureC || 22.5} °C
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400">الوصول المقدر (ETA):</span>
                  <div className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                    {new Date(selectedShipment.estimatedArrivalTime).toLocaleTimeString('fr-DZ', {
                      timeZone: 'Africa/Algiers',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400">ختم الأمان (ADR):</span>
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    مغلق ومطابق
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Active Shipments List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              الشحنات المتتبعة ({filteredShipments.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time GPS</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالشحنة، الولاية، اللوحة..."
                className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {['ALL', 'IN_TRANSIT', 'DELAYED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'ALL' ? 'الكل' : st === 'IN_TRANSIT' ? 'في الطريق' : 'متأخرة'}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">جاري استرجاع إحداثيات الأسطول...</div>
            ) : filteredShipments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">لا توجد شحنات مطابقة للفلتر.</div>
            ) : (
              filteredShipments.map((shp) => {
                const isSelected = selectedShipment?._id === shp._id;
                const isDelayed = shp.status === 'DELAYED';

                return (
                  <div
                    key={shp._id}
                    onClick={() => setSelectedShipment(shp)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black font-mono text-xs text-slate-900 dark:text-white">
                        {shp.reference}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isDelayed
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isDelayed ? 'متأخرة' : 'في الطريق'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        <span>إلى: <strong>{shp.destination?.city}</strong></span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {shp.truck?.plateNumber}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>السائق: {shp.driver?.fullName?.ar || 'معتمد'}</span>
                      <span className="font-mono text-emerald-500 font-bold">
                        {shp.currentLocation?.speedKmH || 0} كم/سا
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
