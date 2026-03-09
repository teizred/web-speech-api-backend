import PDFDocument from "pdfkit";

export const generateLossesPdf = (losses, stream) => {
  const doc = new PDFDocument({ margin: 25 }); 
  doc.pipe(stream);

  // Titre ultra compact
  doc.fontSize(12).font("Helvetica-Bold").text("PERTES McDONALD'S", { align: "center" });
  doc.fontSize(8).font("Helvetica").text(
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    { align: "center" }
  );
  doc.y += 2;

  // Colonnes (ajustées pour la marge de 25)
  const colWidths = [280, 70, 70, 70];
  
  const drawHeaders = (y) => {
    const cy = y || doc.y;
    doc.fontSize(7).font("Helvetica-Bold").fillColor("#475569");
    doc.text("PRODUIT", 25, cy, { width: colWidths[0] });
    doc.text("TAILLE", 25 + colWidths[0], cy, { width: colWidths[1] });
    doc.text("QTÉ", 25 + colWidths[0] + colWidths[1], cy, { width: colWidths[2] });
    doc.text("HEURE", 25 + colWidths[0] + colWidths[1] + colWidths[2], cy, { width: colWidths[3] });
    doc.y = cy + 10;
    doc.font("Helvetica");
  };

  drawHeaders(doc.y);

  const formatQuantity = (loss) => {
    if (loss.unit_type === "weight") {
      if (loss.quantity >= 1000) return `${(loss.quantity / 1000).toFixed(2)} kg`;
      return `${loss.quantity} g`;
    }
    if (loss.unit_type === "pieces") return `${loss.quantity} pc`;
    if (loss.unit_type === "liquid") {
      if (loss.quantity >= 1000) return `${(loss.quantity / 1000).toFixed(2)} L`;
      return `${loss.quantity} ml`;
    }
    return loss.quantity.toString();
  };

  let currentLossType = null;
  let currentCategory = null;
  let currentSubcategory = null;

  losses.forEach((loss, index) => {
    const lossType = loss.loss_type || "AUTRE";
    const lossCategory = loss.category || "AUTRE";
    const lossSubcategory = loss.subcategory || "AUTRE";

    // Type (Vide/Complet)
    if (lossType !== currentLossType) {
      if (currentLossType !== null && doc.y > 780) {
          doc.addPage();
          drawHeaders(doc.y);
      } else if (currentLossType !== null) doc.y += 8;
      
      currentLossType = lossType;
      currentCategory = null; 
      currentSubcategory = null;
      
      const title = currentLossType === 'vide' ? "VIDE" : (currentLossType === 'complet' ? "COMPLET" : "AUTRE");
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#dc2626");
      doc.text(`[ ${title} ]`, 25, doc.y, { align: "center" });
      doc.y += 5;
    }

    // Catégorie
    if (lossCategory !== currentCategory) {
      if (currentCategory !== null && doc.y > 790) {
        doc.addPage();
        drawHeaders(doc.y);
      } else if (currentCategory !== null) doc.y += 3;
      
      currentCategory = lossCategory;
      currentSubcategory = null;
      
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#334155");
      doc.text(`--- ${currentCategory.toUpperCase()} ---`, 25, doc.y);
      doc.y += 3;
    }

    // Sous-catégorie
    if (lossSubcategory !== currentSubcategory && lossSubcategory !== "AUTRE" && lossSubcategory !== "null") {
      if (currentSubcategory !== null && doc.y > 800) {
        doc.addPage();
        drawHeaders(doc.y);
      }
      currentSubcategory = lossSubcategory;
      doc.fontSize(7.5).font("Helvetica-Oblique").fillColor("#64748b");
      doc.text(`  (${currentSubcategory})`, 25, doc.y);
      doc.y += 2;
    }

    // Check page end
    if (doc.y > 815) {
      doc.addPage();
      drawHeaders(doc.y);
    }
    
    const rowY = doc.y;
    doc.fontSize(7.5).font("Helvetica").fillColor("#000000");

    doc.text(loss.product, 25, rowY, { width: colWidths[0], height: 9, ellipsis: true });
    doc.text(loss.size || "—", 25 + colWidths[0], rowY, { width: colWidths[1] });
    doc.text(formatQuantity(loss), 25 + colWidths[0] + colWidths[1], rowY, { width: colWidths[2] });
    doc.text(
      new Date(loss.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      25 + colWidths[0] + colWidths[1] + colWidths[2],
      rowY,
      { width: colWidths[3] }
    );

    doc.y = rowY + 9; 
  });

  doc.y += 5;
  doc.fontSize(8).font("Helvetica-Bold").text(`Total: ${losses.length} pertes`, { align: "right" });

  doc.end();
  return doc;
};
