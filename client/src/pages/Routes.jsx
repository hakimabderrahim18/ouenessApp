import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import {
  Route as RouteIcon,
  Navigation,
  Fuel,
  Clock,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Leaf,
  Layers,
} from 'lucide-react';

const originMarkerIcon = L.divIcon({
  className: 'route-origin-icon',
  html: `<div style="background-color: #ea580c; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">A</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destMarkerIcon = L.divIcon({
  className: 'route-dest-icon',
  html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">B</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const Routes = () => {
  const { t, i18n } = useTranslation();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestinationCity, setSelectedDestinationCity] = useState('Alger');
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const algerianDestinations = [
    { city: 'Alger (الجزائر العاصمة)', lat: 36.7538, lng: 3.0588 },
    { city: 'Oran (وهران الباهية)', lat: 35.6987, lng: -0.6349 },
    { city: 'Constantine (قسنطينة عاصمة الشرق)', lat: 36.3650, lng: 6.6147 },
    { city: 'Tiaret (تيارت الهضاب العليا)', lat: 35.3710, lng: 1.3170 },
    { city: 'Ouargla (ورقلة بوابة الصحراء)', lat: 31.9500, lng: 5.3200 },
    { city: 'Bechar (بشار الجنوب الغربي)', lat: 31.6167, lng: -2.2167 },
  ];

  useEffect(() => {
    const fetchWh = async () => {
      try {
        const res = await api.get('/inventory/warehouses');
        if (res.data?.success && res.data.data.length > 0) {
          setWarehouses(res.data.data);
          setSelectedOrigin(res.data.data[0]._id);
          // Auto run preview
          runOptimization(res.data.data[0]._id, algerianDestinations[0]);
        }
      } catch (err) {
        console.error('Fetch warehouses error:', err);
      }
    };
    fetchWh();
  }, []);

  const runOptimization = async (originWhId, destObj) => {
    setLoading(true);
    try {
      const originWh = warehouses.find((w) => w._id === originWhId) || warehouses[0];
      if (!originWh) return;

      const originCoord = originWh.location;
      const destCoord = { lat: destObj.lat, lng: destObj.lng };

      const res = await api.post('/shipments/optimize-route', {
        origin: originCoord,
        destination: destCoord,
      });

      if (res.data?.success) {
        setOptimizationResult(res.data.data);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const destObj = algerianDestinations.find((d) => d.city.includes(selectedDestinationCity)) || algerianDestinations[0];
    runOptimization(selectedOrigin, destObj);
  };

  const currentOrigin = warehouses.find((w) => w._id === selectedOrigin);
  const currentDest = algerianDestinations.find((d) => d.city.includes(selectedDestinationCity)) || algerianDestinations[0];

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <RouteIcon className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">{t('nav.routes')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            خوارزميات اقتراح أفضل المسارات، تقليل استهلاك الوقود والانبعاثات
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20 shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>OSRM + Heuristic Active</span>
        </div>
      </div>

      {/* Corridor Selector Form */}
      <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            مستودع / مصفاة الانطلاق (نقطة أ)
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-brand-500"
          >
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name?.ar} ({w.city})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            محطة الوصول / الاستهلاك (نقطة ب)
          </label>
          <select
            value={selectedDestinationCity}
            onChange={(e) => setSelectedDestinationCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-brand-500"
          >
            {algerianDestinations.map((d) => (
              <option key={d.city} value={d.city}>
                {d.city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>حساب ومقارنة المسار الأمثل</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comparison Metrics Grid */}
      {optimizationResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>المسافة المختصرة</span>
              <Navigation className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {optimizationResult.optimized.distanceKm} كم
            </div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>توفير {optimizationResult.savings.distanceSavedKm} كم عن المسار التقليدي</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>الزمن المقدر للرحلة</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {Math.floor(optimizationResult.optimized.durationMinutes / 60)} سا{' '}
              {optimizationResult.optimized.durationMinutes % 60} د
            </div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>تقليص {optimizationResult.savings.durationSavedMins} دقيقة</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>تكلفة الوقود المقدرة</span>
              <Fuel className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {optimizationResult.optimized.fuelCostDZD?.toLocaleString()} دج
            </div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>وفر مالي: {optimizationResult.savings.fuelSavedDZD?.toLocaleString()} دج</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>تقليل انبعاثات الكربون</span>
              <Leaf className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-500">
              -{optimizationResult.savings.co2ReducedKg} كغ CO2
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              مبادرة الاستدامة الطاقوية الخضراء
            </div>
          </div>
        </div>
      )}

      {/* Map comparison visualization */}
      <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2">
          <div className="font-bold text-slate-800 dark:text-white">دليل خريطة المسارات:</div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">المسار الذكي المقترح (Optimized)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-amber-500 opacity-60 border border-dashed border-amber-600"></span>
            <span className="text-slate-400">المسار الالتفافي التقليدي (Standard)</span>
          </div>
        </div>

        <MapContainer
          center={[34.5, 3.5]}
          zoom={6}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Markers */}
          {currentOrigin && (
            <Marker position={[currentOrigin.location.lat, currentOrigin.location.lng]} icon={originMarkerIcon}>
              <Popup>نقطة الانطلاق: {currentOrigin.name?.ar}</Popup>
            </Marker>
          )}

          {currentDest && (
            <Marker position={[currentDest.lat, currentDest.lng]} icon={destMarkerIcon}>
              <Popup>نقطة الوصول: {currentDest.city}</Popup>
            </Marker>
          )}

          {/* Polyline for Optimized Route */}
          {optimizationResult?.optimized?.waypoints && (
            <Polyline
              positions={optimizationResult.optimized.waypoints.map((w) => [w.lat, w.lng])}
              pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Routes;
