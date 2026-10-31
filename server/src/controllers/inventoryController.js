const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const { logAudit } = require('../services/auditService');
const { emitNotification } = require('../services/notificationService');

// 1. Warehouses
const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().populate('manager', 'fullName email phone');
    return res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'INVENTORY',
      targetId: warehouse._id,
      targetModel: 'Warehouse',
      description: {
        ar: `إنشاء مستودع جديد (${warehouse.name.ar}) في ولاية (${warehouse.city})`,
        fr: `Création du nouvel entrepôt (${warehouse.name.fr}) à (${warehouse.city})`,
        en: `Created new warehouse (${warehouse.name.en}) in (${warehouse.city})`,
      },
    });
    return res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

// 2. Products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, warehouse, status, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (warehouse) filter.warehouse = warehouse;

    if (search) {
      filter.$or = [
        { 'name.ar': new RegExp(search, 'i') },
        { 'name.fr': new RegExp(search, 'i') },
        { 'name.en': new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(filter)
      .populate('warehouse', 'name city code location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: products,
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

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('warehouse');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'المنتج غير موجود.',
          fr: 'Produit introuvable.',
          en: 'Product not found.',
        },
      });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Scan lookup by QR code or SKU
const lookupProductByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({
      $or: [{ sku: code.toUpperCase() }, { barcodeData: code }, { qrCodeData: code }],
    }).populate('warehouse');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'لم يتم العثور على أي منتج يطابق رمز المسح.',
          fr: 'Aucun produit ne correspond au code scanné.',
          en: 'No product matched the scanned code.',
        },
      });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, unit, warehouse, quantity, minThreshold, maxCapacity, unitPriceDZD, hazardClass } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: {
          ar: 'رمز SKU للمنتج موجود مسبقاً في النظام.',
          fr: 'Le code SKU existe déjà dans la base.',
          en: 'SKU already exists in the system.',
        },
      });
    }

    const qrData = JSON.stringify({
      app: 'LogiNaft',
      sku: sku.toUpperCase().trim(),
      name: name.latin || name.ar,
      category,
      unit,
    });

    const product = await Product.create({
      name,
      sku: sku.toUpperCase().trim(),
      category,
      unit: unit || 'liter',
      warehouse,
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) || 5000,
      maxCapacity: Number(maxCapacity) || 50000,
      unitPriceDZD: Number(unitPriceDZD) || 0,
      hazardClass: hazardClass || 'Class 3 - Flammable Liquids (ADR)',
      qrCodeData: qrData,
      barcodeData: sku.toUpperCase().trim(),
    });

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'INVENTORY',
      targetId: product._id,
      targetModel: 'Product',
      description: {
        ar: `إضافة منتج طاقوي جديد (${product.name.ar}) برمز (${product.sku})`,
        fr: `Ajout d'un nouveau produit (${product.name.fr}) SKU (${product.sku})`,
        en: `Added new energy product (${product.name.en}) SKU (${product.sku})`,
      },
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Generate QR Code image as Data URL
const getProductQRCode = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

    const qrData = product.qrCodeData || product.sku;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return res.status(200).json({ success: true, qrDataUrl });
  } catch (error) {
    next(error);
  }
};

// Generate Barcode image as Base64 Data URL via bwip-js
const getProductBarcode = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

    const text = product.barcodeData || product.sku;
    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: text,
        scale: 3,
        height: 12,
        includetext: true,
        textxalign: 'center',
      },
      (err, png) => {
        if (err) return next(err);
        const barcodeDataUrl = `data:image/png;base64,${png.toString('base64')}`;
        return res.status(200).json({ success: true, barcodeDataUrl });
      }
    );
  } catch (error) {
    next(error);
  }
};

// 3. Stock Movements (Entry, Exit, Transfer, Adjustment)
const createStockMovement = async (req, res, next) => {
  try {
    const {
      type,
      productId,
      quantity,
      sourceWarehouseId,
      destinationWarehouseId,
      reason,
      documentReference,
      notes,
    } = req.body;

    const moveQty = Number(quantity);
    if (!moveQty || moveQty <= 0) {
      return res.status(400).json({
        success: false,
        message: {
          ar: 'الكمية يجب أن تكون أكبر من الصفر.',
          fr: 'La quantité doit être supérieure à zéro.',
          en: 'Quantity must be greater than zero.',
        },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'المنتج غير موجود.',
          fr: 'Produit introuvable.',
          en: 'Product not found.',
        },
      });
    }

    const ref = `MVT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const previousQty = product.quantity;

    if (type === 'ENTRY') {
      product.quantity += moveQty;
    } else if (type === 'EXIT') {
      if (product.quantity < moveQty) {
        return res.status(400).json({
          success: false,
          message: {
            ar: `الكمية المتوفرة بالمخزون (${product.quantity}) أقل من الكمية المطلوبة سحبها (${moveQty}).`,
            fr: `Stock insuffisant (${product.quantity}) pour effectuer la sortie de (${moveQty}).`,
            en: `Insufficient stock (${product.quantity}) for exit of (${moveQty}).`,
          },
        });
      }
      product.quantity -= moveQty;
    } else if (type === 'ADJUSTMENT') {
      product.quantity = moveQty;
    } else if (type === 'TRANSFER') {
      if (!destinationWarehouseId) {
        return res.status(400).json({
          success: false,
          message: {
            ar: 'يرجى تحديد المستودع الوجهة للتحويل.',
            fr: 'Veuillez sélectionner l\'entrepôt de destination.',
            en: 'Please select destination warehouse.',
          },
        });
      }
      if (product.quantity < moveQty) {
        return res.status(400).json({
          success: false,
          message: {
            ar: 'الكمية المتوفرة غير كافية للتحويل.',
            fr: 'Stock insuffisant pour le transfert.',
            en: 'Insufficient stock for transfer.',
          },
        });
      }
      product.quantity -= moveQty;

      // Check if product exists in destination warehouse, or update/create
      let destProduct = await Product.findOne({
        sku: product.sku,
        warehouse: destinationWarehouseId,
      });

      if (destProduct) {
        destProduct.quantity += moveQty;
        await destProduct.save();
      } else {
        await Product.create({
          name: product.name,
          sku: product.sku,
          category: product.category,
          unit: product.unit,
          warehouse: destinationWarehouseId,
          quantity: moveQty,
          minThreshold: product.minThreshold,
          maxCapacity: product.maxCapacity,
          unitPriceDZD: product.unitPriceDZD,
          hazardClass: product.hazardClass,
          qrCodeData: product.qrCodeData,
          barcodeData: product.barcodeData,
        });
      }
    }

    await product.save();

    // Create Stock Movement record
    const movement = await StockMovement.create({
      reference: ref,
      type,
      product: product._id,
      quantity: moveQty,
      sourceWarehouse: sourceWarehouseId || product.warehouse,
      destinationWarehouse: destinationWarehouseId || null,
      performedBy: req.user._id,
      reason: reason || '',
      documentReference: documentReference || '',
      notes: notes || '',
      timestamp: new Date(),
    });

    // Smart Stock Alert Check
    if (product.quantity <= product.minThreshold) {
      await emitNotification(req.app, {
        title: {
          ar: `⚠️ تنبيه حرج: اقتراب نفاذ مخزون (${product.name.ar})`,
          fr: `⚠️ Alerte Critique: Stock bas pour (${product.name.fr})`,
          en: `⚠️ Critical Alert: Low stock for (${product.name.en})`,
        },
        message: {
          ar: `انخفض رصيد المنتج (${product.sku}) إلى (${product.quantity} ${product.unit})، وهو أقل من حد الأمان المحدد (${product.minThreshold}).`,
          fr: `Le niveau du produit (${product.sku}) est à (${product.quantity} ${product.unit}), inférieur au seuil d'alerte (${product.minThreshold}).`,
          en: `Stock level for (${product.sku}) reached (${product.quantity} ${product.unit}), below safe threshold (${product.minThreshold}).`,
        },
        category: 'WARNING',
        priority: 'HIGH',
        targetType: 'ALL',
        metadata: { productId: product._id, currentQty: product.quantity, threshold: product.minThreshold },
      });
    }

    // Immutable Audit Trail
    await logAudit({
      user: req.user,
      action: type === 'ENTRY' ? 'STOCK_IN' : type === 'EXIT' ? 'STOCK_OUT' : 'STOCK_TRANSFER',
      module: 'INVENTORY',
      targetId: movement._id,
      targetModel: 'StockMovement',
      description: {
        ar: `تسجيل حركة مخزون (${type}) للمنتج (${product.name.ar}) بكمية (${moveQty} ${product.unit})، الرصيد السابق: ${previousQty} -> الحالي: ${product.quantity}`,
        fr: `Mouvement de stock (${type}) pour (${product.name.fr}) quantité (${moveQty}), stock avant: ${previousQty} -> après: ${product.quantity}`,
        en: `Stock movement (${type}) for (${product.name.en}) qty (${moveQty}), before: ${previousQty} -> after: ${product.quantity}`,
      },
      changes: { before: { quantity: previousQty }, after: { quantity: product.quantity } },
    });

    return res.status(201).json({
      success: true,
      data: {
        movement,
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStockMovements = async (req, res, next) => {
  try {
    const { productId, warehouseId, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (productId) filter.product = productId;
    if (warehouseId) filter.sourceWarehouse = warehouseId;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movements = await StockMovement.find(filter)
      .populate('product', 'name sku unit category')
      .populate('sourceWarehouse', 'name city code')
      .populate('destinationWarehouse', 'name city code')
      .populate('performedBy', 'fullName email professionalId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockMovement.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: movements,
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

module.exports = {
  getWarehouses,
  createWarehouse,
  getProducts,
  getProductById,
  lookupProductByCode,
  createProduct,
  getProductQRCode,
  getProductBarcode,
  createStockMovement,
  getStockMovements,
};
