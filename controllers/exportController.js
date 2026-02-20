import { sql } from "../config/db.js";
import { generateLossesPdf } from "../services/pdfService.js";
import { transporter } from "../config/mailer.js";
import { PassThrough } from "stream";

// Ici on gère l'export en PDF direct
export const exportPdf = async (req, res) => {
  try {
    // On récupère toutes les pertes de la journée
    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY product, size
    `;

    // On prépare la réponse pour que le navigateur comprenne que c'est un fichier PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pertes-mcdo-${new Date().toISOString().split("T")[0]}.pdf`
    );

    // On utilise notre service pour générer le PDF et on l'envoie direct dans la réponse
    generateLossesPdf(losses, res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Ici on gère l'envoi du rapport par email
export const exportEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Pareil, on récupère les pertes du jour
    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY product, size
    `;

    // Truc un peu technique : on crée un flux (stream) pour transformer le PDF en buffer
    // ça nous permet de le mettre en pièce jointe sans l'enregistrer sur le disque
    const stream = new PassThrough();
    const chunks = [];
    
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // On configure et on envoie le mail avec Nodemailer
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Pertes McDonald's - ${new Date().toLocaleDateString("fr-FR")}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint le rapport des pertes du ${new Date().toLocaleDateString(
          "fr-FR"
        )}.\n\nTotal : ${losses.reduce((sum, l) => sum + l.quantity, 0)} articles.\n\nCordialement.`,
        attachments: [
          {
            filename: `pertes-mcdo-${new Date().toISOString().split("T")[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      res.json({ message: "Email envoyé avec succès" });
    });

    // On lance la génération du PDF vers notre stream
    generateLossesPdf(losses, stream);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

