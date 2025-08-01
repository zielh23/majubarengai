import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

//CommonJs --> required() --> module.exports = ..
//ESModule (ESM) --> import .. from .. --> export default ...

dotenv.config();

const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: apiKey,
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "apa yang kamu ketahui tentang google gen ai?",
  });
  console.log(response.text);
}

main();