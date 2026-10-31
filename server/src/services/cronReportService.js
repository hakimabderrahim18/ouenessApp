const cron = require('node-cron');
const Report = require('../models/Report');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Shipment = require('../models/Shipment');
const StockMovement = require('../models/StockMovement');
const User = require('../models/User');

const generateReportSnapshot = async (frequency = 'DAILY', type = 'INVENTORY_SUMMARY', customUser = null) => {
  const [products, warehouses, shipments, movements, users] = await Promise.all([
    Product.find().populate('warehouse', 'name city code'),
    Warehouse.find(),
    Shipment.find().populate('originWarehouse products.product'),
    StockMovement.find().sort({ timestamp: -1 }).limit(50),
    User.find({ status: 'active' }).populate('role').sort({ performanceScore: -1 }),
  ]);

  const totalFuelLiters = products
    .filter((p) => p.category === 'fuel')
    .reduce((sum, p) => sum + p.quantity, 0);

  const completedShipments = shipments.filter((s) => s.status === 'ARRIVED').length;
  const delayedShipments = shipments.filter((s) => s.status === 'DELAYED').length;
  const inTransitShipments = shipments.filter((s) => s.status === 'IN_TRANSIT').length;

  const onTimeRate = shipments.length > 0
    ? Number((((shipments.length - delayedShipments) / shipments.length) * 100).toFixed(1))
    : 100;

  const stockPerWarehouse = warehouses.map((w) => {
    const whProds = products.filter((p) => p.warehouse?._id?.toString() === w._id.toString());
    const totalQty = whProds.reduce((sum, p) => sum + p.quantity, 0);
    return {
      warehouseName: w.name?.ar,
      warehouseCity: w.city,
      totalVolume: totalQty,
      occupancyPercent: Math.round((w.currentOccupancyLiters / w.totalCapacityLiters) * 100),
    };
  });

  const topEmployees = users.slice(0, 5).map((u) => ({
    name: u.fullName?.ar,
    latinName: u.fullName?.latin,
    role: u.role?.displayName?.ar,
    score: u.performanceScore,
    completedOperations: u.completedOperationsCount,
    avgTimeMins: u.averageOperationTimeMinutes,
  }));

  const dataSnapshot = {
    totalFuelLiters,
    stockPerWarehouse,
    shipmentsMetrics: {
      total: shipments.length,
      inTransit: inTransitShipments,
      completed: completedShipments,
      delayed: delayedShipments,
      onTimeRate,
    },
    topEmployees,
    recentMovementsCount: movements.length,
  };

  const reportNumber = `RPT-${frequency}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  let title = {
    ar: `التقرير الذكي الدوري (${frequency}) - سلاسل إمداد الطاقة`,
    fr: `Rapport Périodique Intelligent (${frequency}) - Logistique Énergétique`,
    en: `Periodic Smart Logistics Report (${frequency})`,
  };

  if (type === 'EMPLOYEE_PERFORMANCE') {
    title = {
      ar: `تقرير تقييم أداء وإنتاجية الموظفين (${frequency})`,
      fr: `Rapport de Performance des Collaborateurs (${frequency})`,
      en: `Employee Performance & Productivity Report (${frequency})`,
    };
  }

  const report = await Report.create({
    reportNumber,
    title,
    frequency,
    type,
    dataSnapshot,
    generatedBy: customUser ? customUser._id : null,
    generatedByName: customUser ? (customUser.fullName?.latin || customUser.fullName?.ar) : 'Automated Cron Engine (LogiNaft)',
    periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    timestamp: new Date(),
  });

  return report;
};

// Initialize node-cron jobs
const initCronReports = () => {
  console.log('[Cron] ⏱️ Initializing Automated Periodic Smart Reports...');

  // Daily report at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily midnight report generation...');
      await generateReportSnapshot('DAILY', 'INVENTORY_SUMMARY');
    } catch (err) {
      console.error('[Cron Daily Report Error]', err.message);
    }
  });

  // Weekly report every Sunday
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('[Cron] Running weekly report generation...');
      await generateReportSnapshot('WEEKLY', 'SHIPMENTS_SUMMARY');
    } catch (err) {
      console.error('[Cron Weekly Report Error]', err.message);
    }
  });

  // Monthly report 1st of month
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('[Cron] Running monthly consolidated report generation...');
      await generateReportSnapshot('MONTHLY', 'EMPLOYEE_PERFORMANCE');
    } catch (err) {
      console.error('[Cron Monthly Report Error]', err.message);
    }
  });
};

module.exports = {
  initCronReports,
  generateReportSnapshot,
};
