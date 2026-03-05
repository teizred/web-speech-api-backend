import { createOpenAI } from "@ai-sdk/openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const openaiClient = createOpenAI({
  compatibility: "strict",
});
