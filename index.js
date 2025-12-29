const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

const WHISPER_EXE =
  "E:/simples web projects/whisper.cpp/build/bin/Release/whisper-cli.exe";
const MODEL_PATH =
  "E:/simples web projects/whisper.cpp/ggml-tiny.en.bin";

let lastResult = null; 

app.post("/transcribe", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file is required" });
  }

  const audioPath = req.file.path;

  execFile(
    WHISPER_EXE,
    ["-m", MODEL_PATH, "-f", audioPath, "-otxt"],
    (error) => {
      if (error) {
        return res.status(500).json({ error: "Transcription failed" });
      }

      const text = fs.readFileSync(audioPath + ".txt", "utf8").trim();

      fs.unlinkSync(audioPath);
      fs.unlinkSync(audioPath + ".txt");

      lastResult = {
        text,
        timestamp: new Date().toISOString()
      };

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
  console.log(" API running on http://localhost:3000");
});
