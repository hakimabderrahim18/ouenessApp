require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const { sanitizeMongoUri } = require('../config/db');

const seedRolesAndAdmins = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loginaft_db';
    await mongoose.connect(sanitizeMongoUri(rawUri));
    console.log('[Seed] Connected to MongoDB for seeding roles and users...');

    // 1. Roles definition
    const rolesData = [
      {
        name: 'ADMIN',
        displayName: { ar: 'مسؤول النظام الشامل', fr: 'Administrateur Général', en: 'Super Administrator' },
        description: { ar: 'صلاحيات كاملة وغير مقيدة في كل أرجاء النظام والتهيئة التقنية.', fr: 'Accès complet et illimité à l\'ensemble du système.', en: 'Full unrestricted access to entire system and settings.' },
        permissions: ['*'],
        color: '#ef4444',
        isSystem: true,
      },
      {
        name: 'GENERAL_MANAGER',
        displayName: { ar: 'المدير العام للمؤسسة', fr: 'Directeur Général', en: 'General Manager' },
        description: { ar: 'الإشراف الشامل، القرارات الاستراتيجية، التدقيق، والتقارير الإحصائية العليا.', fr: 'Supervision générale, décisions stratégiques, audit et rapports consolidés.', en: 'Overall executive supervision, strategic decisions, audits, and consolidated reports.' },
        permissions: [
          'users:view', 'users:export',
          'roles:view',
          'inventory:view', 'inventory:export',
          'shipments:view', 'shipments:export',
          'fleet:view', 'fleet:export',
          'tracking:view',
          'documents:view', 'documents:export',
          'reports:view', 'reports:create', 'reports:export',
          'audit:view', 'audit:export',
          'ai_assistant:view', 'ai_assistant:create',
          'settings:view'
        ],
        color: '#1e40af',
        isSystem: true,
      },
      {
        name: 'OPERATIONS_MANAGER',
        displayName: { ar: 'مدير العمليات وسلاسل الإمداد', fr: 'Directeur des Opérations', en: 'Operations Manager' },
        description: { ar: 'إدارة ومتابعة العمليات اليومية، النقل، المخازن، الأسطول، وتحسين المسارات.', fr: 'Pilotage des opérations quotidiennes, transport, stocks, flotte et optimisation.', en: 'Operational supervision, transport, warehouses, fleet, and route optimization.' },
        permissions: [
          'users:view',
          'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:export',
          'shipments:view', 'shipments:create', 'shipments:edit', 'shipments:delete', 'shipments:export',
          'fleet:view', 'fleet:create', 'fleet:edit', 'fleet:export',
          'tracking:view', 'tracking:edit',
          'documents:view', 'documents:create', 'documents:export',
          'reports:view', 'reports:create', 'reports:export',
          'audit:view', 'audit:export',
          'ai_assistant:view', 'ai_assistant:create',
        ],
        color: '#0284c7',
        isSystem: true,
      },
      {
        name: 'WAREHOUSE_MANAGER',
        displayName: { ar: 'مدير المستودع والمخازن', fr: 'Responsable Entrepôt', en: 'Warehouse Manager' },
        description: { ar: 'تسجيل حركات الدخول والخروج، الجرد اليومي، مسح QR/Barcode، إصدار وصولات الاستلام.', fr: 'Gestion des entrées/sorties, inventaire, scan QR/Code-barres et bons de réception.', en: 'Stock in/out management, daily inventory, QR/barcode scanning, delivery notes.' },
        permissions: [
          'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:export',
          'shipments:view', 'shipments:edit',
          'documents:view', 'documents:create', 'documents:export',
          'reports:view',
        ],
        color: '#10b981',
        isSystem: true,
      },
      {
        name: 'LOGISTICS_OFFICER',
        displayName: { ar: 'مسؤول التنسيق اللوجستي والنقل', fr: 'Coordinateur Logistique', en: 'Logistics Coordinator' },
        description: { ar: 'توجيه الشحنات، تتبع حركة الشاحنات على الخريطة، تحسين المسارات والتنسيق.', fr: 'Planification des expéditions, géolocalisation en direct, optimisation des itinéraires.', en: 'Shipment dispatching, live GPS fleet tracking, route planning.' },
        permissions: [
          'shipments:view', 'shipments:create', 'shipments:edit', 'shipments:export',
          'fleet:view', 'fleet:edit',
          'tracking:view', 'tracking:edit',
          'documents:view', 'documents:create', 'documents:export',
          'reports:view',
        ],
        color: '#f59e0b',
        isSystem: true,
      },
      {
        name: 'DRIVER',
        displayName: { ar: 'سائق شاحنة نقل المحروقات', fr: 'Chauffeur Poids Lourd', en: 'Fuel Tanker Driver' },
        description: { ar: 'استلام أوامر النقل، تحديث حالة الشحنة وموقعها أثناء المسار حتى نقطة التسليم.', fr: 'Réception des ordres de transport, mise à jour des étapes et statut de livraison.', en: 'Transport orders view, in-transit status and GPS waypoint updates.' },
        permissions: [
          'shipments:view', 'shipments:edit',
          'tracking:view',
          'documents:view',
        ],
        color: '#64748b',
        isSystem: true,
      },
      {
        name: 'AUDITOR',
        displayName: { ar: 'مراقب التدقيق والامتثال', fr: 'Auditeur & Conformité', en: 'Auditor & Compliance' },
        description: { ar: 'مراقبة سجلات النظام الكاملة والتأكد من مطابقة العمليات والقوانين.', fr: 'Contrôle des journaux d\'audit et conformité des opérations logistiques.', en: 'Full audit log monitoring, operations review, and regulatory compliance.' },
        permissions: [
          'audit:view', 'audit:export',
          'reports:view', 'reports:export',
          'users:view',
          'inventory:view',
          'shipments:view',
        ],
        color: '#8b5cf6',
        isSystem: true,
      },
    ];

    // Upsert roles
    const roleMap = {};
    for (const r of rolesData) {
      const savedRole = await Role.findOneAndUpdate(
        { name: r.name },
        { $set: r },
        { upsert: true, new: true }
      );
      roleMap[r.name] = savedRole._id;
      console.log(`[Role] Seeded: ${r.name} - ${r.displayName.ar}`);
    }

    // 2. Official Senior Management & Team Users
    const usersData = [
      {
        fullName: { ar: 'رحموني وناس', latin: 'RAHMOUNI OUNES' },
        email: 'ounes.rahmouni@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-GM01',
        dateOfBirth: new Date('1975-04-12'),
        phone: '+213 550 10 20 30',
        role: roleMap['GENERAL_MANAGER'],
        jobTitle: { ar: 'المدير العام', fr: 'Directeur Général', en: 'General Manager' },
        department: { ar: 'الإدارة العامة والتوجيه الاستراتيجي', fr: 'Direction Générale', en: 'Senior Management' },
        status: 'active',
        preferredLanguage: 'ar',
        isSeniorManagement: true,
        seniorityRank: 1,
        performanceScore: 99,
        completedOperationsCount: 1420,
        averageOperationTimeMinutes: 15,
      },
      {
        fullName: { ar: 'قوراري يوسف', latin: 'GOURRARI YOUCEF' },
        email: 'youcef.gourrari@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-OP02',
        dateOfBirth: new Date('1982-08-25'),
        phone: '+213 555 40 50 60',
        role: roleMap['OPERATIONS_MANAGER'],
        jobTitle: { ar: 'مدير العمليات وسلاسل الإمداد', fr: 'Directeur des Opérations', en: 'Operations Manager' },
        department: { ar: 'إدارة العمليات واللوجستيات', fr: 'Direction des Opérations', en: 'Operations Department' },
        status: 'active',
        preferredLanguage: 'ar',
        isSeniorManagement: true,
        seniorityRank: 2,
        performanceScore: 98,
        completedOperationsCount: 1280,
        averageOperationTimeMinutes: 18,
      },
      {
        fullName: { ar: 'مسؤول النظام الرئيسي', latin: 'System Administrator' },
        email: 'admin@loginaft.dz',
        password: 'Admin@2026',
        professionalId: 'DZ-LNF-SYS00',
        dateOfBirth: new Date('1990-01-01'),
        phone: '+213 550 00 00 00',
        role: roleMap['ADMIN'],
        jobTitle: { ar: 'مسؤول النظام التقني', fr: 'Administrateur Système', en: 'System Administrator' },
        department: { ar: 'نظم المعلومات والتحول الرقمي', fr: 'Systèmes d\'Information', en: 'IT & Digital' },
        status: 'active',
        preferredLanguage: 'ar',
        isSeniorManagement: false,
        seniorityRank: 0,
        performanceScore: 95,
        completedOperationsCount: 950,
        averageOperationTimeMinutes: 12,
      },
      {
        fullName: { ar: 'أحمد بن علي', latin: 'Ahmed Benali' },
        email: 'ahmed.benali@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-WH03',
        dateOfBirth: new Date('1988-11-15'),
        phone: '+213 661 11 22 33',
        role: roleMap['WAREHOUSE_MANAGER'],
        jobTitle: { ar: 'مدير مستودع حاسي مسعود', fr: 'Responsable Entrepôt Hassi Messaoud', en: 'Warehouse Manager Hassi Messaoud' },
        department: { ar: 'التخزين والمستودعات', fr: 'Gestion des Stocks', en: 'Warehousing' },
        status: 'active',
        preferredLanguage: 'ar',
        isSeniorManagement: false,
        seniorityRank: 3,
        performanceScore: 92,
        completedOperationsCount: 840,
        averageOperationTimeMinutes: 24,
      },
      {
        fullName: { ar: 'كريم منصوري', latin: 'Karim Mansouri' },
        email: 'karim.mansouri@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-LOG04',
        dateOfBirth: new Date('1992-06-20'),
        phone: '+213 770 99 88 77',
        role: roleMap['LOGISTICS_OFFICER'],
        jobTitle: { ar: 'منسق لوجستي أرزيو ووهران', fr: 'Coordinateur Logistique Arzew/Oran', en: 'Logistics Coordinator Arzew/Oran' },
        department: { ar: 'التوزيع والنقل', fr: 'Distribution & Transport', en: 'Distribution' },
        status: 'active',
        preferredLanguage: 'fr',
        isSeniorManagement: false,
        seniorityRank: 4,
        performanceScore: 90,
        completedOperationsCount: 710,
        averageOperationTimeMinutes: 22,
      },
      {
        fullName: { ar: 'مصطفى خليفي', latin: 'Mustapha Khelifi' },
        email: 'mustapha.khelifi@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-DRV05',
        dateOfBirth: new Date('1985-03-08'),
        phone: '+213 552 33 44 55',
        role: roleMap['DRIVER'],
        jobTitle: { ar: 'سائق صهريج محروقات ثقيل', fr: 'Chauffeur Citerne Poids Lourd', en: 'Fuel Tanker Driver' },
        department: { ar: 'أسطول النقل الطرقي', fr: 'Flotte de Transport', en: 'Road Fleet' },
        status: 'active',
        preferredLanguage: 'ar',
        isSeniorManagement: false,
        seniorityRank: 5,
        performanceScore: 94,
        completedOperationsCount: 620,
        averageOperationTimeMinutes: 35,
      },
      {
        fullName: { ar: 'فاطمة الزهراء بوجمعة', latin: 'Fatima Zohra Boudjemaa' },
        email: 'fatima.boudjemaa@loginaft.dz',
        password: 'Password@2026',
        professionalId: 'DZ-LNF-AUD06',
        dateOfBirth: new Date('1991-09-19'),
        phone: '+213 558 77 66 55',
        role: roleMap['AUDITOR'],
        jobTitle: { ar: 'مفتشة التدقيق والامتثال القانوني', fr: 'Auditrice & Conformité Réglementaire', en: 'Auditor & Regulatory Compliance' },
        department: { ar: 'التدقيق ومراقبة التسيير', fr: 'Audit & Contrôle de Gestion', en: 'Audit & Internal Control' },
        status: 'active',
        preferredLanguage: 'fr',
        isSeniorManagement: false,
        seniorityRank: 4,
        performanceScore: 96,
        completedOperationsCount: 540,
        averageOperationTimeMinutes: 20,
      },
    ];

    for (const u of usersData) {
      // Find or create user
      let existingUser = await User.findOne({ email: u.email });
      if (existingUser) {
        // Update user fields without re-hashing if not modified
        existingUser.fullName = u.fullName;
        existingUser.professionalId = u.professionalId;
        existingUser.role = u.role;
        existingUser.jobTitle = u.jobTitle;
        existingUser.department = u.department;
        existingUser.isSeniorManagement = u.isSeniorManagement;
        existingUser.seniorityRank = u.seniorityRank;
        existingUser.phone = u.phone;
        existingUser.status = u.status;
        existingUser.performanceScore = u.performanceScore;
        existingUser.completedOperationsCount = u.completedOperationsCount;
        existingUser.averageOperationTimeMinutes = u.averageOperationTimeMinutes;
        await existingUser.save();
        console.log(`[User] Updated: ${u.email} - ${u.fullName.latin}`);
      } else {
        const newUser = new User(u);
        await newUser.save();
        console.log(`[User] Created: ${u.email} - ${u.fullName.latin}`);
      }
    }

    console.log('[Seed] Seeding of roles and senior management completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedRolesAndAdmins();
