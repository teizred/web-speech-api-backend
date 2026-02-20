import { createOpenAI } from "@ai-sdk/openai";
import dotenv from "dotenv";

dotenv.config();

export const openaiClient = createOpenAI({
  compatibility: "strict",
});
