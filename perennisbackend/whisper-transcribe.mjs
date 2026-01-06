import 'dotenv/config';
import fs from "fs";
import OpenAI from "openai";

// make sure OPENAI_API_KEY is in .env or environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  // 1) Export audio from your YouTube video once as lesson2-audio.mp3
 const audioFilePath = "./videoplayback.m4a";


  if (!fs.existsSync(audioFilePath)) {
    console.error("Audio file not found:", audioFilePath);
    process.exit(1);
  }

  console.log("Transcribing audio:", audioFilePath);

  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: "whisper-1",
    language: "en", // adjust if needed
  });

  // resp.text is the full transcript
  fs.writeFileSync("./lesson2-transcript.txt", resp.text, "utf8");
  console.log("Transcript written to lesson2-transcript.txt");
}

main().catch((err) => {
  console.error("Whisper error:", err);
  process.exit(1);
});
