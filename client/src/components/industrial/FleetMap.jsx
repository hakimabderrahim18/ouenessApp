import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Radio } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Modern Colorful Markers
const createRefineryIcon = (code) =>
  L.divIcon({
    className: 'custom-refinery-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0284c7, #0891b2);
      border: 2px solid #ffffff;
      border-radius: 8px;
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.4);
    ">
      <span style="
        transform: rotate(-45deg);
        font-family: monospace;
        font-size: 9px;
        font-weight: 800;
        color: #ffffff;
      ">${code.slice(3, 6)}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createDepotIcon = (code) =>
  L.divIcon({
    className: 'custom-depot-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #059669, #10b981);
      border: 2px solid #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    ">
      <span style="
        font-family: monospace;
        font-size: 9px;
        font-weight: 800;
        color: #ffffff;
      ">${code.slice(3, 6)}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createTruckIcon = (reg, speed, isDelayed) =>
  L.divIcon({
    className: 'custom-truck-marker',
    html: `<div style="
      background: ${isDelayed ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #0284c7, #06b6d4)'};
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      padding: 3px 8px;
      font-family: monospace;
      font-size: 10px;
      font-weight: 800;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 4px 12px ${isDelayed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(14, 165, 233, 0.4)'};
      display: flex;
      align-items: center;
      gap: 5px;
    ">
      <span>🚛 ${reg}</span>
      <span style="opacity: 0.85; font-size: 9px;">| ${speed}km/h</span>
    </div>`,
    iconSize: [120, 26],
    iconAnchor: [60, 13],
  });

export const FleetMap = ({
  trucks = [],
  height = '420px',
}) => {
  const hubs = [
    {
      code: 'WH-HMD-01',
      name: 'Pôle Sud - Hassi Messaoud',
      type: 'refinery',
      coords: [31.6800, 6.0600],
      products: 'Brut Sahara, Gasoil 10PPM, Condensat',
      stock: '2 850 000 L',
    },
    {
      code: 'WH-ARZ-02',
      name: 'Pôle Ouest - Raffinerie Arzew',
      type: 'refinery',
      coords: [35.8500, -0.3167],
      products: 'Gasoil, Sans Plomb 95, Butane B13, Propane P35',
      stock: '4 120 000 L',
    },
    {
      code: 'WH-SKI-03',
      name: 'Pôle Est - Raffinerie Skikda',
      type: 'refinery',
      coords: [36.8700, 6.9000],
      products: 'Gasoil, Jet A-1, Sans Plomb 95, Lubrifiants',
      stock: '3 940 000 L',
    },
    {
      code: 'WH-ALG-04',
      name: 'Dépôt Central Alger - Sidi Arcine',
      type: 'depot',
      coords: [36.7200, 3.1200],
      products: 'Carburants Capitale, Butane, Lubrifiants',
      stock: '1 480 000 L',
    },
    {
      code: 'WH-TIA-05',
      name: 'Dépôt Régional Tiaret (Hauts-Plateaux)',
      type: 'depot',
      coords: [35.3700, 1.3200],
      products: 'Gasoil Agro, Propane P35, Sans Plomb',
      stock: '890 000 L',
    },
  ];

  const defaultTrucks = [
    {
      id: 'TRK-01',
      reg: '00421-120-30',
      coords: [34.5000, 4.5000],
      driver: 'K. Benali (ADR-09)',
      product: 'Gasoil 10PPM (38 450 L)',
      speed: 72,
      origin: 'Hassi Messaoud',
      destination: 'Alger Sidi Arcine',
      corridor: 'RN3 / RN1',
      isDelayed: false,
    },
    {
      id: 'TRK-02',
      reg: '01892-122-16',
      coords: [35.6000, 0.5000],
      driver: 'M. Cherif (ADR-14)',
      product: 'Sans Plomb 95 (39 100 L)',
      speed: 68,
      origin: 'Arzew',
      destination: 'Tiaret',
      corridor: 'RN4',
      isDelayed: false,
    },
    {
      id: 'TRK-03',
      reg: '00733-121-21',
      coords: [36.4500, 4.8000],
      driver: 'R. Belkacem (ADR-02)',
      product: 'Jet A-1 (36 800 L)',
      speed: 0,
      origin: 'Skikda',
      destination: 'Alger Aéroport',
      corridor: 'Autoroute A1',
      isDelayed: true,
    },
  ];

  const displayTrucks = trucks.length > 0 ? trucks : defaultTrucks;

  const corridorRN3 = [
    [31.6800, 6.0600],
    [33.1000, 6.0500],
    [34.8500, 5.7300],
    [35.5500, 6.1700],
    [36.3600, 6.6100],
    [36.7200, 3.1200],
  ];

  const corridorA1 = [
    [35.8500, -0.3167],
    [36.0500, 1.3500],
    [36.7200, 3.1200],
    [36.4000, 4.8000],
    [36.8700, 6.9000],
  ];

  const corridorRN4 = [
    [35.8500, -0.3167],
    [35.7500, 0.5500],
    [35.3700, 1.3200],
  ];

  return (
    <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111C30] rounded-2xl overflow-hidden select-none text-start shadow-sm flex flex-col justify-between w-full min-w-0 max-w-full">
      {/* Map Control Header */}
      <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-title font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              Supervision Géolocalisée en Direct
            </h4>
            <p className="text-[11px] text-slate-400 truncate">5 Hubs Stratégiques & Corridors (RN1, RN3, RN4, A1)</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm rotate-45 inline-block shrink-0" />
            <span>Raffinerie</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block shrink-0" />
            <span>Dépôt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block shrink-0" />
            <span>Retard</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="relative z-0 w-full min-w-0 h-[340px] sm:h-[420px]">
        <MapContainer
          center={[34.8, 3.5]}
          zoom={6}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#0F172A' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* National Corridors */}
          <Polyline positions={corridorRN3} color="#0891B2" weight={3} dashArray="4, 6" opacity={0.8} />
          <Polyline positions={corridorA1} color="#3B82F6" weight={3.5} opacity={0.8} />
          <Polyline positions={corridorRN4} color="#F59E0B" weight={3} opacity={0.85} />

          {/* Hub Markers */}
          {hubs.map((hub) => (
            <Marker
              key={hub.code}
              position={hub.coords}
              icon={hub.type === 'refinery' ? createRefineryIcon(hub.code) : createDepotIcon(hub.code)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1 text-slate-800">
                  <div className="font-bold border-b pb-1 text-cyan-600">
                    {hub.code} — {hub.name}
                  </div>
                  <div><strong>Produits :</strong> {hub.products}</div>
                  <div><strong>Stock Disponible :</strong> {hub.stock}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Real-time Tanker Markers */}
          {displayTrucks.map((truck) => (
            <Marker
              key={truck.id}
              position={truck.coords}
              icon={createTruckIcon(truck.reg, truck.speed, truck.isDelayed)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1 text-slate-800">
                  <div className="font-bold text-cyan-600 border-b pb-1">
                    Citerne ADR : {truck.reg}
                  </div>
                  <div><strong>Chauffeur :</strong> {truck.driver}</div>
                  <div><strong>Cargaison :</strong> {truck.product}</div>
                  <div><strong>Itinéraire :</strong> {truck.origin} → {truck.destination}</div>
                  <div><strong>Corridor :</strong> {truck.corridor}</div>
                  <div className="pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      truck.isDelayed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {truck.isDelayed ? 'Retard Constaté (+45 min)' : 'Convoi dans les Délais'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer Strip */}
      <div className="p-3 bg-slate-50/70 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">Réseau : A1 (Est-Ouest) | RN3 (Trans-Sahara) | RN4 (Hauts-Plateaux)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Télémétrie GPS Active (Socket.IO)</span>
        </span>
      </div>
    </div>
  );
};

export default FleetMap;
