const Report = require('../models/Report');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Shipment = require('../models/Shipment');
const StockMovement = require('../models/StockMovement');
const User = require('../models/User');
const { generateReportSnapshot } = require('../services/cronReportService');
const { generateOfficialPDF } = require('../services/pdfService');
const { logAudit } = require('../services/auditService');

// Main Dashboard Analytics aggregated endpoints
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [products, warehouses, shipments, movements, users] = await Promise.all([
      Product.find().populate('warehouse', 'name city code'),
      Warehouse.find(),
      Shipment.find().populate('originWarehouse products.product'),
      StockMovement.find().sort({ timestamp: -1 }).limit(100),
      User.find({ status: 'active' }).populate('role'),
    ]);

    // 1. KPI Summaries
    const totalFuelLiters = products
      .filter((p) => p.category === 'fuel')
      .reduce((sum, p) => sum + p.quantity, 0);

    const ongoingShipments = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
    const delayedShipments = shipments.filter((s) => s.status === 'DELAYED').length;
    const arrivedShipments = shipments.filter((s) => s.status === 'ARRIVED').length;

    const onTimeRate = shipments.length > 0
      ? Number((((shipments.length - delayedShipments) / shipments.length) * 100).toFixed(1))
      : 100;

    const lowStockAlerts = products.filter((p) => p.quantity <= p.minThreshold).length;

    // 2. Stock per Warehouse (For Bar Chart)
    const stockByWarehouse = warehouses.map((w) => {
      const whProds = products.filter((p) => p.warehouse?._id?.toString() === w._id.toString());
      const totalVolume = whProds.reduce((sum, p) => sum + p.quantity, 0);
      return {
        name: w.city,
        arName: w.name?.ar,
        volume: totalVolume,
        capacity: w.totalCapacityLiters,
        occupancyRate: Math.round((w.currentOccupancyLiters / w.totalCapacityLiters) * 100),
      };
    });

    // 3. Stock Distribution by Category (For Pie Chart)
    const categoryTotals = {};
    products.forEach((p) => {
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.quantity;
    });

    const categoryDistribution = Object.keys(categoryTotals).map((cat) => ({
      name: cat === 'fuel' ? 'وقود ومحروقات' : cat === 'gas_cylinders' ? 'قارورات غاز' : cat === 'lubricants' ? 'زيوت محركات' : 'معدات',
      category: cat,
      value: categoryTotals[cat],
    }));

    // 4. Movements over time (Past 7 days simulated trend for Area Chart)
    const movementsTrend = [
      { date: 'السبت', entries: 42000, exits: 38000 },
      { date: 'الأحد', entries: 55000, exits: 49000 },
      { date: 'الإثنين', entries: 61000, exits: 58000 },
      { date: 'الثلاثاء', entries: 70000, exits: 64000 },
      { date: 'الأربعاء', entries: 68000, exits: 62000 },
      { date: 'الخميس', entries: 82000, exits: 76000 },
      { date: 'الجمعة', entries: 35000, exits: 30000 },
    ];

    // 5. Top 5 Products by Stock Volume
    const topProducts = [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({
        name: p.name?.ar,
        latin: p.name?.fr,
        sku: p.sku,
        quantity: p.quantity,
        percentage: p.stockPercentage,
        unit: p.unit,
      }));

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalFuelLiters,
          ongoingShipments,
          delayedShipments,
          arrivedShipments,
          onTimeRate,
          lowStockAlerts,
          totalWarehouses: warehouses.length,
          totalActiveEmployees: users.length,
        },
        stockByWarehouse,
        categoryDistribution,
        movementsTrend,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get stored smart reports
const getReports = async (req, res, next) => {
  try {
    const { frequency, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (frequency) filter.frequency = frequency;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(filter)
      .populate('generatedBy', 'fullName email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate manual report
const createManualReport = async (req, res, next) => {
  try {
    const { frequency = 'MANUAL', type = 'INVENTORY_SUMMARY' } = req.body;
    const report = await generateReportSnapshot(frequency, type, req.user);

    await logAudit({
      user: req.user,
      action: 'REPORT_GENERATE',
      module: 'REPORTS',
      targetId: report._id,
      targetModel: 'Report',
      description: {
        ar: `إنشاء تقرير ذكي فوري (${report.title.ar}) برقم (${report.reportNumber})`,
        fr: `Génération manuelle de rapport (${report.title.fr}) N° (${report.reportNumber})`,
        en: `Generated smart report (${report.title.en}) N° (${report.reportNumber})`,
      },
    });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// Export report as PDF
const exportReportAsPDF = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).send('Report not found');

    const snap = report.dataSnapshot || {};
    const items = (snap.topEmployees || []).map((e) => ({
      sku: 'DZ-HR',
      name: `${e.name} (${e.role})`,
      quantity: e.score,
      unit: `Ops: ${e.completedOperations}`,
    }));

    const pdfBuffer = await generateOfficialPDF({
      docType: report.type,
      docNumber: report.reportNumber,
      title: report.title,
      issueDate: report.timestamp,
      generatedByName: report.generatedByName,
      entityDetails: {
        origin: 'Plateforme Centrale LogiNaft Alger',
        destination: 'Direction Générale & Décideurs',
        truck: `Taux Ponctualité: ${snap.shipmentsMetrics?.onTimeRate || 98}%`,
        driver: `Volume Total: ${(snap.totalFuelLiters || 0).toLocaleString()} L`,
      },
      items: items.length > 0 ? items : [{ sku: 'LNF-TOTAL', name: 'Volume Carburant National', quantity: snap.totalFuelLiters || 4500000, unit: 'Litre' }],
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.reportNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getReports,
  createManualReport,
  exportReportAsPDF,
};
