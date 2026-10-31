const axios = require('axios');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');
const Warehouse = require('../models/Warehouse');
const Truck = require('../models/Truck');
const Notification = require('../models/Notification');

// Query live operational state from MongoDB
const getSystemLiveContext = async () => {
  const [products, warehouses, shipments, trucks, alerts] = await Promise.all([
    Product.find().populate('warehouse', 'name city'),
    Warehouse.find(),
    Shipment.find().populate('truck driver originWarehouse products.product'),
    Truck.find().populate('assignedDriver', 'fullName'),
    Notification.find({ category: 'WARNING' }).sort({ timestamp: -1 }).limit(5),
  ]);

  const totalFuelLiters = products
    .filter((p) => p.category === 'fuel')
    .reduce((sum, p) => sum + (p.quantity || 0), 0);

  const lowStockItems = products.filter((p) => p.quantity <= p.minThreshold);
  const activeShipments = shipments.filter((s) => s.status === 'IN_TRANSIT');
  const delayedShipments = shipments.filter((s) => s.status === 'DELAYED');

  return {
    totalFuelLiters,
    products,
    warehouses,
    shipments,
    trucks,
    lowStockItems,
    activeShipments,
    delayedShipments,
    alerts,
  };
};

const queryAiAssistant = async ({ message, userLanguage = 'ar', user }) => {
  const context = await getSystemLiveContext();
  const apiKey = process.env.GEMINI_API_KEY;

  const msgLower = (message || '').toLowerCase();

  // If Gemini API Key is present, call Gemini 1.5 Flash with live system context
  if (apiKey && apiKey.length > 10) {
    try {
      const systemPrompt = `You are the executive AI Assistant for "LogiNaft Smart System", the premier energy logistics platform in Algeria.
You assist General Manager RAHMOUNI OUNES, Operations Manager GOURRARI YOUCEF, and logistics agents.
Current operational context in Algeria:
- Total Fuel in Stock: ${context.totalFuelLiters.toLocaleString()} Liters across ${context.warehouses.length} strategic hubs (Hassi Messaoud, Arzew, Skikda, Alger, Tiaret).
- Low Stock Critical Alerts: ${context.lowStockItems.map((p) => `${p.name.ar} (${p.quantity} ${p.unit}) in ${p.warehouse?.city}`).join(', ') || 'None'}.
- In-Transit Shipments: ${context.activeShipments.length}.
- Delayed Shipments: ${context.delayedShipments.map((s) => `${s.reference} to ${s.destination?.city}`).join(', ') || 'None'}.
- Active Trucks: ${context.trucks.filter((t) => t.status === 'in_transit').length} out of ${context.trucks.length}.

Answer concisely, accurately, and authoritatively in the user's language (${userLanguage}). If they ask for recommendations, suggest rebalancing fuel between Arzew/Hassi Messaoud and Tiaret/Alger.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
            },
          ],
        },
        { timeout: 7000 }
      );

      const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) {
        return {
          reply: replyText,
          suggestions: [
            userLanguage === 'ar' ? 'إعادة موازنة المخزون بين أرزيو وتيارت' : 'Rééquilibrer les stocks entre Arzew et Tiaret',
            userLanguage === 'ar' ? 'تحسين مسار شاحنة سكيكدة المتأخرة' : 'Optimiser le trajet du camion en retard',
          ],
        };
      }
    } catch (err) {
      console.warn('[Gemini AI API Fallback]', err.message);
    }
  }

  // Fallback: Smart Algorithmic Operational Engine with Live Data
  if (msgLower.includes('مخزون') || msgLower.includes('stock') || msgLower.includes('كمية')) {
    if (userLanguage === 'fr') {
      return {
        reply: `Le volume total de carburant stocké dans nos dépôts stratégiques est de **${context.totalFuelLiters.toLocaleString()} Litres**. Nous comptons **${context.lowStockItems.length} produit(s) en seuil critique**, notamment : ${context.lowStockItems.map((p) => `**${p.name.fr}** à ${p.warehouse?.city} (${p.quantity.toLocaleString()} ${p.unit})`).join(', ') || 'Aucun'}.`,
        suggestions: ['Voir le détail du dépôt d\'Arzew', 'Effectuer un bon de transfert de stock'],
      };
    } else if (userLanguage === 'en') {
      return {
        reply: `Total energy fuel stock currently across our national depots is **${context.totalFuelLiters.toLocaleString()} Liters**. We have **${context.lowStockItems.length} critical low-stock alert(s)**: ${context.lowStockItems.map((p) => `**${p.name.en}** in ${p.warehouse?.city} (${p.quantity.toLocaleString()} ${p.unit})`).join(', ') || 'None'}.`,
        suggestions: ['Inspect Hassi Messaoud Depot', 'Initiate stock rebalance transfer'],
      };
    } else {
      return {
        reply: `إجمالي حجم الوقود والمحروقات المخزنة حالياً في المستودعات الوطنية يبلغ **${context.totalFuelLiters.toLocaleString()} لتر**.
يوجد حالياً **${context.lowStockItems.length} منتج يقترب من حد الأمان الأدنى**:
${context.lowStockItems.map((p) => `• **${p.name.ar}** بمستودع (${p.warehouse?.name?.ar || p.warehouse?.city}) - الرصيد الحالي: ${p.quantity.toLocaleString()} ${p.unit}`).join('\n') || '• جميع المستويات في الحدود الآمنة.'}`,
        suggestions: ['تحويل كمية من مصفاة أرزيو إلى تيارت', 'عرض تفاصيل مستودع حاسي مسعود'],
      };
    }
  }

  if (msgLower.includes('متأخر') || msgLower.includes('retard') || msgLower.includes('delayed')) {
    if (userLanguage === 'fr') {
      return {
        reply: context.delayedShipments.length > 0
          ? `Nous constatons **${context.delayedShipments.length} expédition(s) en retard** : ${context.delayedShipments.map((s) => `**${s.reference}** vers ${s.destination?.city} (Camion: ${s.truck?.plateNumber}, Chauffeur: ${s.driver?.fullName?.latin || s.driver?.fullName?.ar}). Heure ETA dépassée.`).join('\n')}`
          : 'Excellente nouvelle : Toutes les expéditions en cours respectent leur délai d\'arrivée estimé (ETA).',
        suggestions: ['Contacter le chauffeur du camion', 'Activer l\'optimisation d\'itinéraire de contournement'],
      };
    } else {
      return {
        reply: context.delayedShipments.length > 0
          ? `يوجد حالياً **${context.delayedShipments.length} شحنة مسجلة كمتأخرة عن موعد الوصول المحدد (ETA)**:
${context.delayedShipments.map((s) => `• الشحنة **${s.reference}** متجهة إلى (${s.destination?.name} - ${s.destination?.city}) على متن الشاحنة (${s.truck?.plateNumber}) بقيادة السائق (${s.driver?.fullName?.ar}).`).join('\n')}
نوصي بالتواصل المباشر مع السائق وتفعيل مسار التفافي بديل.`
          : 'جميع الشحنات الجارية تسير وفق الجدول الزمني المحدد بدقة ولا توجد أي شحنات متأخرة حالياً.',
        suggestions: ['عرض موقع الشاحنة المتأخرة على الخريطة', 'الاتصال بالسائق المعتمد'],
      };
    }
  }

  if (msgLower.includes('اقتراح') || msgLower.includes('توزيع') || msgLower.includes('optimis') || msgLower.includes('suggest')) {
    if (userLanguage === 'fr') {
      return {
        reply: `Recommandations intelligentes d'optimisation logistique :
1. **Rééquilibrage des Stocks :** Transférer 25 000 Litres de Super SP95 du complexe d'Arzew vers le dépôt des Hauts-Plateaux de Tiaret.
2. **Assignation de Flotte :** Mobiliser le camion Actros TRK-ACTROS-01 sur la liaison Biskra-Alger via l'autoroute Est-Ouest.
3. **Économie d'Énergie :** L'activation du module Route AI permet d'économiser environ 14% de carburant par rotation.`,
        suggestions: ['Appliquer le transfert vers Tiaret', 'Générer l\'ordre de transport'],
      };
    } else {
      return {
        reply: `اقتراحات الذكاء الاصطناعي لتحسين التوزيع والعمليات اللوجستية:
1. **إعادة موازنة المخزون الجهوي:** تحويل 25,000 لتر من وقود البنزين الممتاز من مجمع مصفاة أرزيو إلى مستودع تيارت الاستراتيجي لتفادي بلوغ حد الأمان الأدنى.
2. **توزيع أسطول الصهاريج:** توجيه الشاحنة الفارغة بمستودع الجزائر العاصمة نحو محطة سكيكدة لتسريع تزويد المنطقة الشرقية بوقود الطائرات Jet A-1.
3. **خفض تكاليف الوقود:** تطبيق المسارات المقترحة بنظام Route Optimization سيوفر ما يقارب 14% من استهلاك الديزل لكل 1,000 كم.`,
        suggestions: ['تأكيد أمر التحويل بين المستودعات', 'فتح خريطة التتبع المباشر GPS'],
      };
    }
  }

  // General default answer
  return {
    reply: userLanguage === 'fr'
      ? `Bonjour ! Je suis votre Assistant LogiNaft Intelligent. Je supervise en temps réel **${context.activeShipments.length} expéditions**, **${context.warehouses.length} dépôts nationaux**, et **${context.totalFuelLiters.toLocaleString()} Litres de carburant**. Posez-moi vos questions sur les stocks, retards ou recommandations logistiques.`
      : `مرحباً بك! أنا مساعدك الذكي في منصة LogiNaft Smart System. أتابع لحظياً **${context.activeShipments.length} شحنة في الطريق**، و**${context.warehouses.length} مستودعات ومصافي كبرى**، برصيد إجمالي **${context.totalFuelLiters.toLocaleString()} لتر**.
يمكنك سؤالي عن: أرصدة المخزون، الشحنات المتأخرة، مسارات الشاحنات، أو طلب اقتراحات ذكية لتطوير العمليات.`,
    suggestions: [
      userLanguage === 'ar' ? 'كم المخزون اليوم؟' : 'Quel est le stock aujourd\'hui ?',
      userLanguage === 'ar' ? 'أي شحنة متأخرة؟' : 'Quelles expéditions sont en retard ?',
      userLanguage === 'ar' ? 'اقتراحات لتحسين التوزيع' : 'Suggestions d\'optimisation',
    ],
  };
};

module.exports = {
  queryAiAssistant,
};
