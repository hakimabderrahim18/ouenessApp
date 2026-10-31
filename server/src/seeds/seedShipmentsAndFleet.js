require('dotenv').config();
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const Truck = require('../models/Truck');
const Shipment = require('../models/Shipment');
const User = require('../models/User');

const seedShipmentsAndFleet = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loginaft_db');
    console.log('[Seed] Seeding Fleet & Live Shipments...');

    const drivers = await User.find({ status: 'active' });
    const driver = drivers.find((d) => d.role?.name === 'DRIVER') || drivers[0];
    const defaultManager = drivers.find((d) => d.seniorityRank === 2) || drivers[0];

    const warehouses = await Warehouse.find();
    const hmdWh = warehouses.find((w) => w.code === 'WH-HMD-01') || warehouses[0];
    const arzWh = warehouses.find((w) => w.code === 'WH-ARZ-02') || warehouses[1];
    const skiWh = warehouses.find((w) => w.code === 'WH-SKI-03') || warehouses[2];
    const algWh = warehouses.find((w) => w.code === 'WH-ALG-04') || warehouses[3];
    const tiaWh = warehouses.find((w) => w.code === 'WH-TIA-05') || warehouses[4];

    const products = await Product.find();
    const gasoil = products.find((p) => p.sku === 'DZ-LNF-DSL-01') || products[0];
    const sp95 = products.find((p) => p.sku === 'DZ-LNF-SP95-02') || products[1];
    const jetA1 = products.find((p) => p.sku === 'DZ-LNF-JET-A1') || products[2];
    const butane = products.find((p) => p.sku === 'DZ-LNF-BUT-13K') || products[3];

    // 1. Heavy Fuel Tanker Fleet (Mercedes-Benz Actros, Renault K440, Volvo FMX)
    const trucksData = [
      {
        plateNumber: '04521-124-30',
        code: 'TRK-ACTROS-01',
        brand: 'Mercedes-Benz Actros 3344 (Citerne 35K)',
        tankCapacityLiters: 35000,
        tankType: 'FUEL_CISTERN',
        assignedDriver: driver._id,
        status: 'in_transit',
        currentLocation: { lat: 34.8516, lng: 5.7280, speedKmH: 72, headingDeg: 340, lastUpdated: new Date() }, // Near Biskra
        adrCertified: true,
        mileageKm: 142000,
        fuelLevelPercentage: 78,
      },
      {
        plateNumber: '08942-121-31',
        code: 'TRK-RENAULT-02',
        brand: 'Renault Trucks K440 Heavy Duty',
        tankCapacityLiters: 32000,
        tankType: 'FUEL_CISTERN',
        assignedDriver: driver._id,
        status: 'in_transit',
        currentLocation: { lat: 35.6120, lng: 0.8140, speedKmH: 68, headingDeg: 120, lastUpdated: new Date() }, // En route to Tiaret
        adrCertified: true,
        mileageKm: 98500,
        fuelLevelPercentage: 84,
      },
      {
        plateNumber: '11204-123-21',
        code: 'TRK-VOLVO-03',
        brand: 'Volvo FMX 460 Jet Fuel Spec',
        tankCapacityLiters: 38000,
        tankType: 'FUEL_CISTERN',
        assignedDriver: driver._id,
        status: 'in_transit',
        currentLocation: { lat: 36.3650, lng: 4.8210, speedKmH: 45, headingDeg: 260, lastUpdated: new Date() }, // Near Bouira
        adrCertified: true,
        mileageKm: 115000,
        fuelLevelPercentage: 62,
      },
      {
        plateNumber: '03144-122-16',
        code: 'TRK-MAN-04',
        brand: 'MAN TGS 33.400 Cylinder Carrier',
        tankCapacityLiters: 15000,
        tankType: 'CYLINDER_CARRIER',
        assignedDriver: driver._id,
        status: 'available',
        currentLocation: { lat: 36.7022, lng: 3.1258, speedKmH: 0, headingDeg: 0, lastUpdated: new Date() }, // Alger
        adrCertified: true,
        mileageKm: 76000,
        fuelLevelPercentage: 95,
      },
    ];

    const truckMap = {};
    for (const t of trucksData) {
      const savedTruck = await Truck.findOneAndUpdate(
        { code: t.code },
        { $set: t },
        { upsert: true, new: true }
      );
      truckMap[t.code] = savedTruck._id;
      console.log(`[Truck] Seeded: ${t.code} - ${t.plateNumber}`);
    }

    // 2. Realistic Algerian Shipments with Highway Waypoints
    // Route 1: Hassi Messaoud -> Alger (Trans-Sahara / RN3)
    const routeHmdAlg = [
      { lat: 31.6804, lng: 6.0728 }, // HMD
      { lat: 33.1065, lng: 6.0645 }, // Touggourt
      { lat: 34.8516, lng: 5.7280 }, // Biskra
      { lat: 35.6780, lng: 4.2150 }, // Djelfa
      { lat: 36.2641, lng: 2.7539 }, // Medea
      { lat: 36.4700, lng: 2.8300 }, // Blida
      { lat: 36.7022, lng: 3.1258 }, // Alger Sidi Rzine
    ];

    // Route 2: Arzew -> Tiaret (RN4 & RN23)
    const routeArzTia = [
      { lat: 35.8569, lng: -0.3150 }, // Arzew
      { lat: 35.6987, lng: -0.6349 }, // Oran
      { lat: 35.4000, lng: 0.1300 },  // Mascara
      { lat: 35.3710, lng: 1.3170 },  // Tiaret
    ];

    // Route 3: Skikda -> Alger (East-West Highway A1)
    const routeSkiAlg = [
      { lat: 36.8763, lng: 6.9092 }, // Skikda
      { lat: 36.3650, lng: 6.6147 }, // Constantine
      { lat: 36.1900, lng: 5.4100 }, // Setif
      { lat: 36.0700, lng: 4.7600 }, // BBA
      { lat: 36.3650, lng: 3.8900 }, // Bouira
      { lat: 36.7022, lng: 3.1258 }, // Alger
    ];

    const shipmentsData = [
      {
        reference: 'SHP-DZ-2026-HMD-ALG-01',
        products: [{ product: gasoil._id, quantity: 32000, unit: 'liter' }],
        originWarehouse: hmdWh._id,
        destination: {
          name: 'محطة التوزيع المركزية العاصمة (Sidi Rzine)',
          city: 'Alger',
          address: 'Dépôt Sidi Rzine, Baraki',
          location: { lat: 36.7022, lng: 3.1258 },
        },
        truck: truckMap['TRK-ACTROS-01'],
        driver: driver._id,
        status: 'IN_TRANSIT',
        currentLocation: { lat: 34.8516, lng: 5.7280, speedKmH: 72, headingDeg: 340, lastUpdated: new Date() },
        routeWaypoints: routeHmdAlg,
        optimizedRoute: {
          distanceKm: 785.4,
          estimatedDurationMinutes: 680,
          estimatedFuelCostDZD: 7748,
          routeGeometry: routeHmdAlg,
        },
        dispatchTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        estimatedArrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        telemetry: { tankTemperatureC: 23.4, tankPressureBar: 1.04, sealIntact: true },
      },
      {
        reference: 'SHP-DZ-2026-ARZ-TIA-02',
        products: [{ product: sp95._id, quantity: 28000, unit: 'liter' }],
        originWarehouse: arzWh._id,
        destination: {
          name: 'المستودع الجهوي للهضاب العليا بتيارت',
          city: 'Tiaret',
          address: 'Zone Industrielle Zaaroura',
          location: { lat: 35.3710, lng: 1.3170 },
        },
        truck: truckMap['TRK-RENAULT-02'],
        driver: driver._id,
        status: 'IN_TRANSIT',
        currentLocation: { lat: 35.6120, lng: 0.8140, speedKmH: 68, headingDeg: 120, lastUpdated: new Date() },
        routeWaypoints: routeArzTia,
        optimizedRoute: {
          distanceKm: 235.0,
          estimatedDurationMinutes: 210,
          estimatedFuelCostDZD: 2318,
          routeGeometry: routeArzTia,
        },
        dispatchTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        estimatedArrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        telemetry: { tankTemperatureC: 21.8, tankPressureBar: 1.02, sealIntact: true },
      },
      {
        reference: 'SHP-DZ-2026-SKI-ALG-03',
        products: [{ product: jetA1._id, quantity: 30000, unit: 'liter' }],
        originWarehouse: skiWh._id,
        destination: {
          name: 'مستودع تموين مطار هواري بومدين الدولي',
          city: 'Alger',
          address: 'Aéroport d\'Alger Houari Boumediene',
          location: { lat: 36.6910, lng: 3.2150 },
        },
        truck: truckMap['TRK-VOLVO-03'],
        driver: driver._id,
        status: 'DELAYED', // Demonstrates the Delayed status filter!
        currentLocation: { lat: 36.3650, lng: 4.8210, speedKmH: 42, headingDeg: 260, lastUpdated: new Date() },
        routeWaypoints: routeSkiAlg,
        optimizedRoute: {
          distanceKm: 495.2,
          estimatedDurationMinutes: 420,
          estimatedFuelCostDZD: 4885,
          routeGeometry: routeSkiAlg,
        },
        dispatchTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        estimatedArrivalTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // ETA in the past!
        telemetry: { tankTemperatureC: 22.1, tankPressureBar: 1.03, sealIntact: true },
      },
      {
        reference: 'SHP-DZ-2026-ALG-ORN-04',
        products: [{ product: butane._id, quantity: 1200, unit: 'cylinder' }],
        originWarehouse: algWh._id,
        destination: {
          name: 'مركز تعبئة وتوزيع الغاز السانية (وهران)',
          city: 'Oran',
          address: 'Zone Industrielle Es Senia, Oran',
          location: { lat: 35.6500, lng: -0.6200 },
        },
        truck: truckMap['TRK-MAN-04'],
        driver: driver._id,
        status: 'PENDING',
        currentLocation: { lat: 36.7022, lng: 3.1258, speedKmH: 0, headingDeg: 0, lastUpdated: new Date() },
        routeWaypoints: [
          { lat: 36.7022, lng: 3.1258 },
          { lat: 35.6500, lng: -0.6200 },
        ],
        optimizedRoute: {
          distanceKm: 412.0,
          estimatedDurationMinutes: 340,
          estimatedFuelCostDZD: 4064,
          routeGeometry: [],
        },
        dispatchTime: null,
        estimatedArrivalTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        telemetry: { tankTemperatureC: 20.0, tankPressureBar: 1.01, sealIntact: true },
      },
    ];

    for (const s of shipmentsData) {
      s.statusHistory = [
        {
          status: s.status,
          timestamp: s.dispatchTime || new Date(),
          updatedBy: defaultManager._id,
          notes: 'تسجيل مسار الشحنة وتعيين السائق والشاحنة',
          location: s.currentLocation,
        },
      ];

      await Shipment.findOneAndUpdate(
        { reference: s.reference },
        { $set: s },
        { upsert: true, new: true }
      );
      console.log(`[Shipment] Seeded: ${s.reference} - ${s.status}`);
    }

    console.log('[Seed] Fleet and Shipments seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Shipments Seed Error]', err);
    process.exit(1);
  }
};

seedShipmentsAndFleet();
