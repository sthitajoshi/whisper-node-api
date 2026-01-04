const express = require("express");
const multer = require("multer");
const cors = require("cors"); 
const { execFile } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

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

  execFile(
    WHISPER_EXE,
    ["-m", MODEL_PATH, "-f", req.file.path, "-otxt"],
    (error) => {
      if (error) {
        console.error("Whisper failed:", error);
        return res.status(500).json({ error: "Whisper execution failed" });
      }

      const text = fs.readFileSync(req.file.path + ".txt", "utf8");

      lastResult = { text: text.trim() };
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
