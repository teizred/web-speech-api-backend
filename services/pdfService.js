import PDFDocument from "pdfkit";

// C'est ici qu'on construit le fichier PDF
export const generateLossesPdf = (losses, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Le titre et la date en haut de page
  doc.fontSize(20).text("PERTES McDONALD'S", { align: "center" });
  doc.fontSize(12).text(
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    { align: "center" }
  );
  doc.moveDown(2);

  // On prépare les colonnes du tableau
  doc.fontSize(10);
  const startY = doc.y;
  const colWidths = [250, 80, 80, 80];
  const headers = ["Produit", "Taille", "Quantité", "Heure"];

  // On dessine les entêtes
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, startY, { width: colWidths[i], continued: false });
    x += colWidths[i];
  });
  doc.moveDown();

  // On boucle sur chaque perte pour remplir le tableau
  losses.forEach((loss) => {
    const currentY = doc.y;

    doc.text(loss.product, 50, currentY, { width: colWidths[0], continued: false });
    doc.text(loss.size || "—", 50 + colWidths[0], currentY, {
      width: colWidths[1],
      continued: false,
    });
    doc.text(loss.quantity.toString(), 50 + colWidths[0] + colWidths[1], currentY, {
      width: colWidths[2],
      continued: false,
    });
    doc.text(
      new Date(loss.created_at).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      50 + colWidths[0] + colWidths[1] + colWidths[2],
      currentY,
      { width: colWidths[3], continued: false }
    );

    doc.moveDown(0.8);
  });

  const total = losses.reduce((sum, l) => sum + l.quantity, 0);
  doc.moveDown();
  doc.fontSize(12).text(`Total des pertes : ${total}`, { align: "right" });

  doc.end();
  return doc;
};
