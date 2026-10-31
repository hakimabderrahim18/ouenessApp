# LogiNaft Smart System | منصة إدارة وسلاسل إمداد الطاقة الجزائرية

منصة رقمية متكاملة حديثة واحترافية مبنية بتقنيات الـ MERN Stack (MongoDB, Express.js, React 18, Node.js)، مخصصة لمحاكاة وإدارة السلسلة اللوجستية لشركات الطاقة والمحروقات في الجمهورية الجزائرية الديمقراطية الشعبية (المخزون، التوزيع، الأسطول، التتبع الجغرافي المباشر، وتحسين المسارات).

---

## 🏛️ الإدارة العليا المعتمدة (Senior Management)
تم تسجيل وتثبيت الهيكل القيادي الرسمي للمنظومة:
- **المدير العام للمؤسسة (General Manager):** `RAHMOUNI OUNES` (رحموني وناس)
- **مدير العمليات وسلاسل الإمداد (Operations Manager):** `GOURRARI YOUCEF` (قوراري يوسف)

---

## 🔑 الحسابات التجريبية المعتمدة (Demo Accounts)

| الوظيفة / الدور | الاسم الكامل | البريد الإلكتروني | كلمة المرور |
| :--- | :--- | :--- | :--- |
| **المدير العام (General Manager)** | RAHMOUNI OUNES (رحموني وناس) | `ounes.rahmouni@loginaft.dz` | `Password@2026` |
| **مدير العمليات (Operations Manager)** | GOURRARI YOUCEF (قوراري يوسف) | `youcef.gourrari@loginaft.dz` | `Password@2026` |
| **مسؤول النظام (Super Admin)** | System Administrator | `admin@loginaft.dz` | `Admin@2026` |
| **مدير مستودع حاسي مسعود** | Ahmed Benali (أحمد بن علي) | `ahmed.benali@loginaft.dz` | `Password@2026` |
| **مسؤول اللوجستيات (أرزيو)** | Karim Mansouri (كريم منصوري) | `karim.mansouri@loginaft.dz` | `Password@2026` |
| **سائق شاحنة صهريج محروقات** | Mustapha Khelifi (مصطفى خليفي) | `mustapha.khelifi@loginaft.dz` | `Password@2026` |
| **مفتشة التدقيق والامتثال** | Fatima Zohra Boudjemaa | `fatima.boudjemaa@loginaft.dz` | `Password@2026` |

---

## 🚀 طريقة التثبيت والتشغيل السريع (Installation & Quick Start)

### 1. المتطلبات الأساسية
- **Node.js** (v18 فما فوق)
- **MongoDB** قيد التشغيل على المنفذ الافتراضي `27017`

### 2. تثبيت الحزم (Dependencies)
```bash
# تثبيت حزم المجلد الرئيسي والخادم والواجهة
npm run install:all
```

### 3. تغذية قاعدة البيانات بالبيانات الجزائرية الواقعية (Master Seed)
```bash
# ينشئ الأدوار، الإدارة العليا، المستخدمين، المستودعات الاستراتيجية، المنتجات الطاقوية، الأسطول، والشحنات الحية
npm run seed
```

### 4. تشغيل المنصة في وضع التطوير (Full-Stack Dev Mode)
```bash
# في المجلد الرئيسي (يشغل الواجهة والخادم معاً):
npm run dev

# أو تشغيل كل طرف بشكل منفصل:
# الخادم: (Port 5000)
npm run dev:server

# الواجهة: (Port 5173)
npm run dev:client
```

---

## 🌐 Déploiement en Production (Render & Vercel)

### 1. Déploiement Backend sur [Render.com](https://render.com)
Le backend Node.js / Express / Socket.IO peut être déployé soit via le fichier Blueprint [`render.yaml`](./render.yaml) soit manuellement en tant que **Web Service** :

1. Créez un nouveau **Web Service** sur Render et connectez votre dépôt GitHub.
2. Définissez les paramètres suivants :
   - **Root Directory :** `server`
   - **Runtime :** `Node`
   - **Build Command :** `npm install`
   - **Start Command :** `npm start`
   - **Health Check Path :** `/api/health`
3. Ajoutez les variables d'environnement (**Environment Variables**) :
   - `NODE_ENV` : `production`
   - `PORT` : `10000` (ou laissez Render attribuer le port automatiquement)
   - `MONGO_URI` : Votre chaîne de connexion MongoDB Atlas (ex: `mongodb+srv://...`)
   - `JWT_ACCESS_SECRET` : Clé secrète aléatoire
   - `JWT_REFRESH_SECRET` : Clé secrète aléatoire
   - `CLIENT_URL` : L'URL de votre frontend sur Vercel (ex: `https://votre-app.vercel.app`)
4. Initialiser les données de démonstration :
   - Dans le tableau de bord Render, ouvrez l'onglet **Shell** de votre service et exécutez :
     ```bash
     npm run seed
     ```

---

### 2. Déploiement Frontend sur [Vercel.com](https://vercel.com)
Le frontend React 18 / Vite / Tailwind est configuré pour Vercel avec gestion complète du routage SPA (`vercel.json`) :

1. Importez votre dépôt GitHub sur **Vercel**.
2. Dans la configuration du projet :
   - **Framework Preset :** `Vite`
   - **Root Directory :** `client` (ou laissez la racine grâce au `vercel.json` racine)
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
3. Ajoutez la variable d'environnement (**Environment Variable**) :
   - `VITE_API_BASE_URL` : L'URL publique de votre backend Render avec `/api` (ex: `https://loginaft-server.onrender.com/api`)
4. Cliquez sur **Deploy**. Votre application est immédiatement en ligne et prête pour la production !

---

## 🌟 الميزات المكتملة في النظام (System Capabilities)

1. **نظام متعدد اللغات وفوري (i18n):**
   - دعم كامل للغة العربية (RTL مع خطوط Cairo/Tajawal)، والفرنسية والإنجليزية (LTR).
   - تحويل فوري للغة بدون إعادة تحميل الصفحة مع حفظ التفضيل في ملف المستخدم.

2. **الهيكل التنظيمي والإدارة العليا الرسمية:**
   - عرض هرمي تفاعلي للمدير العام (`RAHMOUNI OUNES`) ومدير العمليات (`GOURRARI YOUCEF`).

3. **حوكمة المستخدمين ونظام الصلاحيات (RBAC):**
   - مصفوفة صلاحيات تفصيلية (`view`, `create`, `edit`, `delete`, `export`) لكل وحدة وظيفية.
   - حماية مسارات الفرونت إند وحراسة الـ API في الباك إند.

4. **نظام التوقيت اليومي وسجل العمليات الزمني (Daily Timestamp System & Audit):**
   - ساعة وتاريخ حي في أعلى كل صفحة بتوقيت الجزائر (`Africa/Algiers`).
   - سجل تدقيق غير قابل للتعديل (Immutable) مع مقارنة التغييرات (Before & After) وعناوين IP والتصدير لـ CSV.

5. **إدارة المخزون الذكي والباركود و QR:**
   - متابعة الأرصدة بالأرقام والنسب المئوية مع شريط تقدم ملون (أخضر، برتقالي، أحمر).
   - تنبيهات آلية عند وصول المخزون لحد الأمان الأدنى.
   - توليد وطباعة بطاقات QR Code والباركود (Code 128) لكل منتج.
   - ماسح كاميرا مدمج (`html5-qrcode`) للتعرف اللحظي وإجراء حركات الإدخال والإخراج والتحويل.

6. **التتبع اللوجستي المباشر وخريطة الجزائر التفاعلية (GPS Tracking & Localisation):**
   - خريطة تفاعلية بتقنية Leaflet تعرض المصافي، المستودعات، الشاحنات، ونقاط التسليم.
   - محاكي GPS مدمج يحرك الشاحنات حياً على مسارات الطرق الوطنية الجزائرية عبر Socket.IO.
   - تمييز آلي للشحنات المتأخرة عند تجاوز موعد الوصول المقدر (ETA).

7. **تحسين المسارات بالذكاء الاصطناعي (Route Optimization):**
   - اقتراح المسار الأمثل ومقارنة المسار التقليدي بالمسار المحسّن (حساب المسافة، والوقت، وتكلفة الوقود بالدينار الجزائري DZD، وتخفيض انبعاثات الكربون).

8. **المساعد الذكي (AI Assistant):**
   - شات ذكي مدعوم بالـ LLM / Gemini مع استدعاء دوال حية تفحص قاعدة بيانات مونغو للإجابة عن أسئلة المخزون والشحنات المتأخرة وتقديم اقتراحات التوزيع.

9. **الوثائق الرسمية بصيغة PDF:**
   - إصدار وصولات التسليم (Bon de Livraison)، الفواتير، محاضر الاستلام (PV de Réception)، تقارير المخزون، ونماذج التجارة الدولية مع رمز التحقق QR وختم الإدارة العليا.

10. **لوحة تحكم إحصائية تفاعلية (Dashboard):**
    - رسوم بيانية حديثة بواسطة Recharts (حجم المخزون حسب المستودع، تدفق الحركات الأسبوعي، توزيع المنتجات، ومعدل الالتزام بالمواعيد).

11. **لوحة أداء الموظفين والتقارير الدورية الذكية (HR Panel & Smart Reports):**
    - ترتيب الموظفين حسب الكفاءة وسرعة الإنجاز مع إبراز الموظف الأفضل.
    - تقارير دورية مؤتمتة ومجدولة بواسطة `node-cron` (يومية، أسبوعية، شهرية) قابلة للتصدير لـ PDF.
