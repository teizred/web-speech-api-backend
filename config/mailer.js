import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// On utilise Resend (API HTTP) au lieu de Nodemailer (SMTP)
// car les hébergeurs cloud comme Railway/Vercel bloquent le SMTP
let _resend = null;

export const getResend = () => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY manquante. Ajoutez-la dans vos variables d'environnement.");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};
