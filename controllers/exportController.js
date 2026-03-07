import { sql } from "../config/db.js";
import { generateLossesPdf } from "../services/pdfService.js";
import { getTransporter } from "../config/mailer.js";
import { PassThrough } from "stream";
import { emailSchema } from "../config/schemas.js";

// Ici on gère l'export en PDF direct
export const exportPdf = async (req, res) => {
  try {
    // On récupère toutes les pertes de la journée
    const losses = await sql`
      SELECT l.*, p.unit_type 
      FROM losses l
      LEFT JOIN products p ON l.product = p.name
      WHERE (l.created_at AT TIME ZONE 'Europe/Paris')::date = (NOW() AT TIME ZONE 'Europe/Paris')::date
      ORDER BY l.product, l.size
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
  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const { email } = parsed.data;

    // On récupère toutes les pertes de la journée avec leur type d'unité
    const losses = await sql`
      SELECT l.*, p.unit_type 
      FROM losses l
      LEFT JOIN products p ON l.product = p.name
      WHERE (l.created_at AT TIME ZONE 'Europe/Paris')::date = (NOW() AT TIME ZONE 'Europe/Paris')::date
      ORDER BY l.product, l.size
    `;

    // Truc un peu technique : on crée un flux (stream) pour transformer le PDF en buffer
    // ça nous permet de le mettre en pièce jointe sans l'enregistrer sur le disque
    const stream = new PassThrough();
    const chunks = [];

    // On utilise une Promise pour attendre que le stream soit terminé
    // et pouvoir catcher proprement les erreurs de sendMail
    const pdfPromise = new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (err) => reject(err));
    });

    // On lance la génération du PDF vers notre stream
    generateLossesPdf(losses, stream);

    // On attend que le PDF soit entièrement généré
    const pdfBuffer = await pdfPromise;

    // On envoie le mail avec Nodemailer
    console.log(`Sending email to: ${email}...`);
    const info = await getTransporter().sendMail({
      from: `"Pertes McDo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Pertes McDonald's - ${new Date().toLocaleDateString("fr-FR")}`,
      text: `Bonjour,\n\nVeuillez trouver ci-joint le rapport des pertes du ${new Date().toLocaleDateString(
        "fr-FR"
      )}.\n\nNombre d'articles/saisies : ${losses.length}.\n\nCordialement.`,
      attachments: [
        {
          filename: `pertes-mcdo-${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    console.log(`Email sent successfully: ${info.messageId}`);

    res.json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

