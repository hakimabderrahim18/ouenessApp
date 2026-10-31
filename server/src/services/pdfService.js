const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateOfficialPDF = async ({
  docType,
  docNumber,
  title,
  issueDate,
  generatedByName,
  entityDetails,
  items,
  language = 'ar',
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 1. Header Banner
      doc.rect(40, 40, 515, 65).fill('#0f172a');

      doc.fillColor('#ffffff').fontSize(16).text('LOGINAFT SMART SYSTEM - ALGERIA', 55, 52, { align: 'left' });
      doc.fontSize(9).fillColor('#38bdf8').text('REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE', 55, 72);
      doc.fontSize(8).fillColor('#94a3b8').text('DIRECTION GENERALE DES OPERATIONS ENERGETIQUES ET LOGISTIQUES', 55, 84);

      // 2. Document Title & Badge
      doc.moveDown(3);
      doc.fillColor('#1e40af').fontSize(14).text(`${title.fr || title.en || docType}`, 40, 120, { align: 'center', underline: true });
      doc.fillColor('#64748b').fontSize(10).text(`N° Ref: ${docNumber} | Date: ${new Date(issueDate).toLocaleString('fr-DZ', { timeZone: 'Africa/Algiers' })}`, { align: 'center' });

      // 3. QR Code verification block
      const qrData = `LOGINAFT-VERIFIED|DOC:${docNumber}|TYPE:${docType}|DATE:${new Date(issueDate).toISOString()}|DZ`;
      const qrBuffer = await QRCode.toBuffer(qrData, { width: 90, margin: 1 });
      doc.image(qrBuffer, 460, 115, { width: 75 });

      // 4. Entity / Shipment Details Box
      doc.roundedRect(40, 160, 400, 65, 8).stroke('#cbd5e1');
      doc.fillColor('#0f172a').fontSize(9);
      doc.text(`Origine / Entrepôt: ${entityDetails.origin || 'Plateforme Logistique Centrale'}`, 50, 170);
      doc.text(`Destination: ${entityDetails.destination || 'Centre de Distribution'}`, 50, 185);
      doc.text(`Transporteur / Matricule: ${entityDetails.truck || 'Citerne Poids Lourd'}`, 50, 200);
      doc.text(`Chauffeur Certifié ADR: ${entityDetails.driver || 'Agent Opérationnel'}`, 50, 215);

      // 5. Table Header
      const tableTop = 245;
      doc.rect(40, tableTop, 515, 22).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(9);
      doc.text('CODE / SKU', 50, tableTop + 6);
      doc.text('DESIGNATION DU PRODUIT', 160, tableTop + 6);
      doc.text('QUANTITE', 360, tableTop + 6);
      doc.text('UNITE', 440, tableTop + 6);
      doc.text('STATUT', 490, tableTop + 6);

      // 6. Table Rows
      let y = tableTop + 24;
      items.forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(40, y, 515, 20).fill(bgColor);

        doc.fillColor('#334155').fontSize(8.5);
        doc.text(item.sku || 'DZ-LNF-ITEM', 50, y + 5);
        doc.text(item.name || 'Produit Pétrolier / Gaz', 160, y + 5, { width: 190 });
        doc.text(`${(item.quantity || 0).toLocaleString()}`, 360, y + 5);
        doc.text(item.unit || 'Litre', 440, y + 5);
        doc.text('CONFORME', 490, y + 5);

        y += 20;
      });

      // 7. Security & ADR Compliance notice
      y += 20;
      doc.roundedRect(40, y, 515, 45, 6).fillAndStroke('#f1f5f9', '#94a3b8');
      doc.fillColor('#0f172a').fontSize(8);
      doc.text('MENTION LEGALE & CONFORMITE TRANSPORT MATIERES DANGEREUSES (ADR) :', 50, y + 8, { underline: true });
      doc.text('Ce document officiel atteste la conformité des jauges, scellés de sécurité et températures des réservoirs.', 50, y + 20);
      doc.text('Validé numériquement selon le règlement national des transports d\'hydrocarbures.', 50, y + 30);

      // 8. Official Signatures Block (Senior Management)
      const sigTop = y + 70;
      doc.rect(40, sigTop, 240, 75).stroke('#cbd5e1');
      doc.rect(315, sigTop, 240, 75).stroke('#cbd5e1');

      // General Manager
      doc.fillColor('#1e40af').fontSize(8.5).text('LE DIRECTEUR GENERAL (المدير العام)', 50, sigTop + 8);
      doc.fillColor('#0f172a').fontSize(9).text('RAHMOUNI OUNES (رحموني وناس)', 50, sigTop + 22);
      doc.fillColor('#059669').fontSize(7.5).text('VISA & APPROBATION OFFICIELLE [VALIDE]', 50, sigTop + 45);

      // Operations Manager
      doc.fillColor('#0284c7').fontSize(8.5).text('LE DIRECTEUR DES OPERATIONS (مدير العمليات)', 325, sigTop + 8);
      doc.fillColor('#0f172a').fontSize(9).text('GOURRARI YOUCEF (قوراري يوسف)', 325, sigTop + 22);
      doc.fillColor('#059669').fontSize(7.5).text('CONTROLE CONFORME AU DISPATCH [VALIDE]', 325, sigTop + 45);

      // Footer
      doc.fontSize(7).fillColor('#94a3b8').text('LogiNaft Smart System DZ - Imprimé électroniquement avec traçabilité et horodatage immuable.', 40, 780, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateOfficialPDF,
};
