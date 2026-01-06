const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".wav"); // force .wav
  },
});

const upload = multer({ storage });

// Whisper paths
const WHISPER_EXE =
  "E:/simples web projects/whisper.cpp/build/bin/Release/whisper-cli.exe";

const MODEL_PATH =
  "E:/simples web projects/whisper.cpp/ggml-tiny.en.bin";

let lastResult = null;

app.post("/transcribe", upload.single("audio"), (req, res) => {
  console.log("Received request");

  if (!req.file) {
    return res.status(400).json({ error: "Audio file required" });
  }

  const inputPath = req.file.path;          
  const outputBase = inputPath;             
  const outputTxt = outputBase + ".txt";    

  execFile(
    WHISPER_EXE,
    [
      "-m", MODEL_PATH,
      "-f", inputPath,
      "-otxt",
      "-of", outputBase
    ],
    (error) => {
      if (error) {
        console.error("Whisper failed:", error);
        return res.status(500).json({ error: "Whisper execution failed" });
      }

      if (!fs.existsSync(outputTxt)) {
        return res.status(500).json({
          error: "Transcription file not generated",
          expectedFile: outputTxt,
        });
      }

      const text = fs.readFileSync(outputTxt, "utf8").trim();

      lastResult = { text };
      res.json(lastResult);
    }
  );
});

app.get("/last-result", (req, res) => {
  if (!lastResult) {
    return res.json({ message: "No transcription yet" });
  }
  res.json(lastResult);
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
