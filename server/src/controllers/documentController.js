const Document = require('../models/Document');
const Shipment = require('../models/Shipment');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const { generateOfficialPDF } = require('../services/pdfService');
const { logAudit } = require('../services/auditService');

// Get all generated documents
const getDocuments = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { documentNumber: new RegExp(search, 'i') },
        { 'title.ar': new RegExp(search, 'i') },
        { 'title.fr': new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const docs = await Document.find(filter)
      .populate('generatedBy', 'fullName professionalId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: docs,
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

// Generate and stream official PDF
const generateAndDownloadPDF = async (req, res, next) => {
  try {
    const { type, shipmentId, language = 'ar' } = req.body;

    let entityDetails = {};
    let items = [];
    let title = {};
    const docNumber = `DOC-DZ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (shipmentId) {
      const shipment = await Shipment.findById(shipmentId)
        .populate('originWarehouse')
        .populate('truck')
        .populate('driver')
        .populate('products.product');

      if (shipment) {
        entityDetails = {
          origin: `${shipment.originWarehouse?.name?.fr || shipment.originWarehouse?.name?.ar} (${shipment.originWarehouse?.city})`,
          destination: `${shipment.destination?.name} (${shipment.destination?.city})`,
          truck: `${shipment.truck?.plateNumber} - ${shipment.truck?.brand}`,
          driver: `${shipment.driver?.fullName?.latin || shipment.driver?.fullName?.ar} (${shipment.driver?.professionalId})`,
        };

        items = shipment.products.map((p) => ({
          sku: p.product?.sku || 'DZ-LNF',
          name: p.product?.name?.fr || p.product?.name?.ar,
          quantity: p.quantity,
          unit: p.unit,
        }));
      }
    } else {
      // General inventory snapshot
      const prods = await Product.find().limit(8);
      items = prods.map((p) => ({
        sku: p.sku,
        name: p.name?.fr || p.name?.ar,
        quantity: p.quantity,
        unit: p.unit,
      }));
      entityDetails = {
        origin: 'Direction Générale LogiNaft Alger',
        destination: 'Ensemble des Centres Régionaux de Distribution',
        truck: 'Flotte Nationale Conforme ADR',
        driver: 'Agents Logistiques Certifiés',
      };
    }

    if (type === 'DELIVERY_NOTE') {
      title = { ar: 'وصل تسليم وشحن محروقات رسمي', fr: 'BON DE LIVRAISON HYDROCARBURES (ADR)' };
    } else if (type === 'INVOICE') {
      title = { ar: 'فاتورة تجارية لوجستية معتمدة', fr: 'FACTURE COMMERCIALE LOGISTIQUE' };
    } else if (type === 'RECEIPT_PV') {
      title = { ar: 'محضر إيداع واستلام شحنة طاقة', fr: 'PROCES-VERBAL DE RECEPTION & DEPOTAGE' };
    } else if (type === 'TRANSPORT_ORDER') {
      title = { ar: 'أمر نقل وتوزيع طاقة رسمي', fr: 'ORDRE DE MISSION ET TRANSPORT HYDROCARBURES' };
    } else if (type === 'PACKING_LIST') {
      title = { ar: 'قائمة شحن وطرود للمبادلات الدولية', fr: 'PACKING LIST & BORDEREAU D\'EXPEDITION' };
    } else {
      title = { ar: 'تقرير الجرد العام للمخزون الطاقوي', fr: 'RAPPORT GENERAL D\'INVENTAIRE DES STOCKS' };
    }

    const pdfBuffer = await generateOfficialPDF({
      docType: type,
      docNumber,
      title,
      issueDate: new Date(),
      generatedByName: req.user?.fullName?.latin || 'Opérateur LogiNaft',
      entityDetails,
      items,
      language,
    });

    // Save document record in DB
    const docRecord = await Document.create({
      documentNumber: docNumber,
      type,
      title,
      language,
      generatedBy: req.user._id,
      metadata: { itemsCount: items.length, origin: entityDetails.origin, destination: entityDetails.destination },
      timestamp: new Date(),
    });

    await logAudit({
      user: req.user,
      action: 'PDF_EXPORT',
      module: 'DOCUMENTS',
      targetId: docRecord._id,
      targetModel: 'Document',
      description: {
        ar: `إصدار وتحميل وثيقة رسمية بصيغة PDF: (${title.ar}) برقم (${docNumber})`,
        fr: `Génération et téléchargement PDF officiel: (${title.fr}) N° (${docNumber})`,
        en: `Generated official PDF document: (${title.fr}) N° (${docNumber})`,
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${docNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  generateAndDownloadPDF,
};
