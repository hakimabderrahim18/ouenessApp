import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { Truck, Warehouse, MapPin, Play, Pause, AlertTriangle, ShieldCheck, Clock, Gauge, Thermometer, Radio } from 'lucide-react';

// Custom SVG Icons for Leaflet
const createWarehouseIcon = (type) => {
  const isRefinery = type === 'REFINERY';
  const color = isRefinery ? '#ea580c' : '#3b82f6';
  return L.divIcon({
    className: 'custom-warehouse-icon',
    html: `
      <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 10px; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const createTruckIcon = (status, heading = 0) => {
  const isDelayed = status === 'DELAYED';
  const color = isDelayed ? '#ef4444' : '#10b981';
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.5s ease; background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px ${isDelayed ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}; display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-dest-icon',
    html: `
      <div style="background-color: #8b5cf6; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const LeafletMap = ({ selectedShipmentId, onSelectShipment }) => {
  const [mapData, setMapData] = useState({ warehouses: [], shipments: [], trucks: [] });
  const [simulatorRunning, setSimulatorRunning] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch initial tracking data
  const fetchMapData = async () => {
    try {
      const res = await api.get('/shipments/map-data');
      if (res.data?.success) {
        setMapData(res.data.data);
        setSimulatorRunning(res.data.data.simulatorStatus?.isRunning);
      }
    } catch (err) {
      console.error('Failed to load tracking map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();

    // Listen to real-time telemetry updates via Socket.IO
    const getSocketTarget = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (import.meta.env.VITE_API_BASE_URL) {
        try {
          return new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin).origin;
        } catch (e) {
          return '/';
        }
      }
      return '/';
    };

    const socket = io(getSocketTarget(), { path: '/socket.io' });

    socket.on('truck_position_update', (update) => {
      setMapData((prev) => {
        const updatedShipments = prev.shipments.map((s) => {
          if (s._id === update.shipmentId) {
            return {
              ...s,
              currentLocation: update.location,
              status: update.status,
              telemetry: update.telemetry,
            };
          }
          return s;
        });
        return { ...prev, shipments: updatedShipments };
      });
    });

    socket.on('shipment_delayed', (delayedShipment) => {
      setMapData((prev) => {
        const updated = prev.shipments.map((s) =>
          s._id === delayedShipment._id ? { ...s, status: 'DELAYED' } : s
        );
        return { ...prev, shipments: updated };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleSimulator = async () => {
    const nextAction = simulatorRunning ? 'stop' : 'start';
    try {
      const res = await api.post('/shipments/simulator', { action: nextAction });
      if (res.data?.success) {
        setSimulatorRunning(res.data.status?.isRunning);
      }
    } catch (err) {
      console.error('Toggle simulator error:', err);
    }
  };

  return (
    <div className="relative w-full min-w-0 max-w-full h-[380px] sm:h-[620px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Live Simulator Status Floating Pill */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-700 text-white shadow-xl max-w-[calc(100%-1.5rem)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${simulatorRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></span>
          <span className="text-[11px] sm:text-xs font-bold truncate">
            {simulatorRunning ? 'محاكي GPS نشط' : 'المحاكي متوقف'}
          </span>
        </div>

        <button
          onClick={toggleSimulator}
          className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
          title={simulatorRunning ? 'إيقاف المحاكي' : 'تشغيل المحاكي'}
        >
          {simulatorRunning ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Map Container */}
      <MapContainer
        center={[35.0, 3.5]} // Centered on Northern & Central Algeria
        zoom={6}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Warehouses Markers */}
        {mapData.warehouses.map((wh) => (
          <Marker
            key={wh._id}
            position={[wh.location.lat, wh.location.lng]}
            icon={createWarehouseIcon(wh.type)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-600">
                  {wh.type === 'REFINERY' ? 'مصفاة ومجمع بترولي' : 'مستودع تخزين استراتيجي'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{wh.name?.ar}</h4>
                <div className="text-xs text-slate-500 font-mono">{wh.city} | {wh.code}</div>
                <div className="mt-2 text-xs text-slate-600 border-t pt-1">
                  السعة: {(wh.totalCapacityLiters / 1000000).toFixed(1)} مليون لتر
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 2. Destination Markers */}
        {mapData.shipments.map((shp) => (
          <Marker
            key={`dest-${shp._id}`}
            position={[shp.destination.location.lat, shp.destination.location.lng]}
            icon={createDestinationIcon()}
          >
            <Popup>
              <div className="p-2 text-right">
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  نقطة التسليم والوصول
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-1">{shp.destination.name}</h4>
                <div className="text-xs text-slate-500">{shp.destination.city}</div>
                <div className="text-xs text-slate-600 mt-1">الشحنة: {shp.reference}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Polylines for Active Routes */}
        {mapData.shipments.map((shp) => {
          if (!shp.routeWaypoints || shp.routeWaypoints.length < 2) return null;
          const isSelected = selectedShipmentId === shp._id;
          const isDelayed = shp.status === 'DELAYED';
          const routeColor = isDelayed ? '#ef4444' : isSelected ? '#3b82f6' : '#10b981';

          return (
            <Polyline
              key={`route-${shp._id}`}
              positions={shp.routeWaypoints.map((w) => [w.lat, w.lng])}
              pathOptions={{
                color: routeColor,
                weight: isSelected ? 5 : 3.5,
                opacity: 0.8,
                dashArray: isDelayed ? '6, 6' : undefined,
              }}
            />
          );
        })}

        {/* 4. Moving Trucks Markers */}
        {mapData.shipments.map((shp) => {
          const lat = shp.currentLocation?.lat;
          const lng = shp.currentLocation?.lng;
          if (!lat || !lng) return null;

          const isDelayed = shp.status === 'DELAYED';

          return (
            <Marker
              key={`truck-${shp._id}`}
              position={[lat, lng]}
              icon={createTruckIcon(shp.status, shp.currentLocation?.headingDeg || 0)}
              eventHandlers={{
                click: () => onSelectShipment && onSelectShipment(shp),
              }}
            >
              <Popup>
                <div className="p-3 text-right max-w-xs">
                  {isDelayed ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>تأخر تجاوز توقيت الوصول (ETA Delayed)</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                      في الطريق (In Transit)
                    </span>
                  )}

                  <h4 className="font-black text-slate-900 text-sm mt-1">{shp.reference}</h4>
                  <div className="text-xs font-mono text-slate-500">
                    الشاحنة: {shp.truck?.plateNumber} ({shp.truck?.brand})
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-slate-400">السرعة:</span>
                      <div className="font-bold font-mono">{shp.currentLocation?.speedKmH || 0} كم/سا</div>
                    </div>
                    <div>
                      <span className="text-slate-400">السائق:</span>
                      <div className="font-semibold text-slate-800">{shp.driver?.fullName?.ar || 'سائق معتمد'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">الحرارة:</span>
                      <div className="font-mono">{shp.telemetry?.tankTemperatureC || 22.5} °C</div>
                    </div>
                    <div>
                      <span className="text-slate-400">الضغط:</span>
                      <div className="font-mono">{shp.telemetry?.tankPressureBar || 1.05} Bar</div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t text-[11px] text-slate-500">
                    <span>الوجهة: </span>
                    <strong className="text-slate-800">{shp.destination?.name} ({shp.destination?.city})</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
