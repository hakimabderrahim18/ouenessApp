require('dotenv').config();
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const User = require('../models/User');
const { sanitizeMongoUri } = require('../config/db');

const seedInventory = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loginaft_db';
    await mongoose.connect(sanitizeMongoUri(rawUri));
    console.log('[Seed] Seeding Warehouses & Energy Products...');

    const managers = await User.find({ status: 'active' });
    const defaultManager = managers[0]?._id;

    // 1. Strategic Algerian Warehouses
    const warehousesData = [
      {
        name: { ar: 'مستودع ومصفاة حاسي مسعود الكبرى', fr: 'Complexe Raffinerie Hassi Messaoud', en: 'Hassi Messaoud Refining Complex' },
        code: 'WH-HMD-01',
        city: 'Hassi Messaoud',
        location: { lat: 31.6804, lng: 6.0728, address: 'Zone Industrielle Nord, Hassi Messaoud, Ouargla' },
        type: 'REFINERY',
        totalCapacityLiters: 15000000,
        currentOccupancyLiters: 11200000,
        phone: '+213 29 73 11 22',
        manager: defaultManager,
      },
      {
        name: { ar: 'مجمع مصفاة وتصدير أرزيو', fr: 'Pôle Pétrochimique Arzew', en: 'Arzew Petrochemical Hub' },
        code: 'WH-ARZ-02',
        city: 'Arzew',
        location: { lat: 35.8569, lng: -0.3150, address: 'Zone Industrielle d\'Arzew, Oran' },
        type: 'REFINERY',
        totalCapacityLiters: 18000000,
        currentOccupancyLiters: 14500000,
        phone: '+213 41 47 20 30',
        manager: defaultManager,
      },
      {
        name: { ar: 'مستودع سكيكدة البترولي المركزي', fr: 'Terminal Pétrolier Skikda', en: 'Skikda Oil Terminal' },
        code: 'WH-SKI-03',
        city: 'Skikda',
        location: { lat: 36.8763, lng: 6.9092, address: 'Plateforme Industrielle Portuaire, Skikda' },
        type: 'CENTRAL_DEPOT',
        totalCapacityLiters: 12000000,
        currentOccupancyLiters: 8900000,
        phone: '+213 38 75 40 50',
        manager: defaultManager,
      },
      {
        name: { ar: 'مستودع التوزيع المركزي سيدي رزين (الجزائر)', fr: 'Dépôt Central Sidi Rzine Alger', en: 'Sidi Rzine Central Depot Algiers' },
        code: 'WH-ALG-04',
        city: 'Alger',
        location: { lat: 36.7022, lng: 3.1258, address: 'Baraki / Sidi Rzine, Alger' },
        type: 'REGIONAL_DEPOT',
        totalCapacityLiters: 8000000,
        currentOccupancyLiters: 6100000,
        phone: '+213 21 52 33 44',
        manager: defaultManager,
      },
      {
        name: { ar: 'مستودع تيارت الاستراتيجي للهضاب العليا', fr: 'Dépôt Stratégique Tiaret Hauts-Plateaux', en: 'Tiaret Strategic Depot' },
        code: 'WH-TIA-05',
        city: 'Tiaret',
        location: { lat: 35.3710, lng: 1.3170, address: 'Zone d\'Activités Zaaroura, Tiaret' },
        type: 'DISTRIBUTION_CENTER',
        totalCapacityLiters: 5000000,
        currentOccupancyLiters: 1850000,
        phone: '+213 46 42 10 20',
        manager: defaultManager,
      },
    ];

    const whMap = {};
    for (const w of warehousesData) {
      const savedWh = await Warehouse.findOneAndUpdate(
        { code: w.code },
        { $set: w },
        { upsert: true, new: true }
      );
      whMap[w.code] = savedWh._id;
      console.log(`[Warehouse] Seeded: ${w.code} - ${w.name.ar}`);
    }

    // 2. Strategic Energy Products
    const productsData = [
      {
        name: { ar: 'وقود المازوت عالي الجودة (Gasoil 10PPM)', fr: 'Gasoil Haute Qualité 10PPM', en: 'High-Grade Gasoil 10PPM' },
        sku: 'DZ-LNF-DSL-01',
        category: 'fuel',
        unit: 'liter',
        warehouse: whMap['WH-HMD-01'],
        quantity: 850000,
        minThreshold: 150000,
        maxCapacity: 1200000,
        unitPriceDZD: 29.01,
        hazardClass: 'Class 3 - Flammable Liquids (UN 1202)',
      },
      {
        name: { ar: 'بنزين ممتاز بدون رصاص (Super SP95)', fr: 'Essence Sans Plomb Super SP95', en: 'Unleaded Super SP95 Gasoline' },
        sku: 'DZ-LNF-SP95-02',
        category: 'fuel',
        unit: 'liter',
        warehouse: whMap['WH-ARZ-02'],
        quantity: 620000,
        minThreshold: 120000,
        maxCapacity: 950000,
        unitPriceDZD: 45.62,
        hazardClass: 'Class 3 - Flammable Liquids (UN 1203)',
      },
      {
        name: { ar: 'بنزين عادي ممتاز للمحطات', fr: 'Essence Normale Station', en: 'Regular Motor Gasoline' },
        sku: 'DZ-LNF-NORM-03',
        category: 'fuel',
        unit: 'liter',
        warehouse: whMap['WH-ALG-04'],
        quantity: 340000,
        minThreshold: 80000,
        maxCapacity: 500000,
        unitPriceDZD: 43.71,
        hazardClass: 'Class 3 - Flammable Liquids (UN 1203)',
      },
      {
        name: { ar: 'وقود الطائرات النفاثة (Jet A-1)', fr: 'Carburant Aviation Jet A-1', en: 'Jet A-1 Aviation Fuel' },
        sku: 'DZ-LNF-JET-A1',
        category: 'fuel',
        unit: 'liter',
        warehouse: whMap['WH-SKI-03'],
        quantity: 420000,
        minThreshold: 100000,
        maxCapacity: 600000,
        unitPriceDZD: 78.50,
        hazardClass: 'Class 3 - Aviation Turbine (UN 1863)',
      },
      {
        name: { ar: 'قارورة غاز بوتان للاستعمال المنزلي (13 كغ)', fr: 'Bouteille Gaz Butane B13 (13kg)', en: 'Butane Gas Cylinder B13 (13kg)' },
        sku: 'DZ-LNF-BUT-13K',
        category: 'gas_cylinders',
        unit: 'cylinder',
        warehouse: whMap['WH-ALG-04'],
        quantity: 14500,
        minThreshold: 3000,
        maxCapacity: 20000,
        unitPriceDZD: 200.00,
        hazardClass: 'Class 2.1 - Flammable Gases (UN 1965)',
      },
      {
        name: { ar: 'قارورة غاز بروبان صناعي وفلاحي (35 كغ)', fr: 'Bouteille Propane Industriel P35 (35kg)', en: 'Propane Gas Cylinder P35 (35kg)' },
        sku: 'DZ-LNF-PRP-35K',
        category: 'gas_cylinders',
        unit: 'cylinder',
        warehouse: whMap['WH-TIA-05'],
        quantity: 1200, // Critical low stock example!
        minThreshold: 2000,
        maxCapacity: 8000,
        unitPriceDZD: 650.00,
        hazardClass: 'Class 2.1 - Flammable Gases (UN 1978)',
      },
      {
        name: { ar: 'زيوت محركات شاحنات ثقيلة نفطيا (15W40)', fr: 'Huile Moteur Diesel Lourd Naftilia 15W40', en: 'Heavy Duty Engine Oil 15W40' },
        sku: 'DZ-LNF-LUB-15W40',
        category: 'lubricants',
        unit: 'barrel',
        warehouse: whMap['WH-ARZ-02'],
        quantity: 3400,
        minThreshold: 800,
        maxCapacity: 5000,
        unitPriceDZD: 28500.00,
        hazardClass: 'Non-Hazardous Lubricant',
      },
      {
        name: { ar: 'خراطيم تفريغ معتمدة مضادة للشرر (2 بوصة)', fr: 'Flexible de Dépotage Antistatique 2"', en: 'Antistatic Discharge Hose 2"' },
        sku: 'DZ-LNF-EQ-HOSE2',
        category: 'equipment',
        unit: 'unit',
        warehouse: whMap['WH-HMD-01'],
        quantity: 85,
        minThreshold: 20,
        maxCapacity: 150,
        unitPriceDZD: 16500.00,
        hazardClass: 'Equipment',
      },
    ];

    for (const p of productsData) {
      p.qrCodeData = JSON.stringify({
        app: 'LogiNaft',
        sku: p.sku,
        name: p.name.en,
        category: p.category,
        unit: p.unit,
      });
      p.barcodeData = p.sku;

      await Product.findOneAndUpdate(
        { sku: p.sku },
        { $set: p },
        { upsert: true, new: true }
      );
      console.log(`[Product] Seeded: ${p.sku} - ${p.name.ar}`);
    }

    console.log('[Seed] Inventory seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Inventory Seed Error]', err);
    process.exit(1);
  }
};

seedInventory();
