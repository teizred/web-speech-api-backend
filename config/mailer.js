import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// On utilise Nodemailer avec SMTP (Gmail)
// EMAIL_USER et EMAIL_PASS sont définis dans le .env
let _transporter = null;

export const getTransporter = () => {
  if (!_transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Identifiants email (EMAIL_USER/EMAIL_PASS) manquants dans le .env.");
    }

    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return _transporter;
};
