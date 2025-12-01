import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

import authRouter from "./src/routers/authRouter.js";
import Them_Ban_Ghi from "./src/routers/CanNangVaBMI/Them_Ban_Ghi.js";

dotenv.config();

// LẤY ĐƯỜNG DẪN TUYỆT ĐỐI
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== CONFIG CAMERA =====================
const RTSP_URL = "rtsp://admin:thang05112004@192.168.100.2:554/ch1/sub"; 
// TODO: sửa thành đúng camera của bạn

const HLS_OUTPUT_DIR = path.join(__dirname, "hls", "cam1");

// ===================== EXPRESS APP =====================
const app = express();
app.use(cors());
app.use(express.json());

// API của bạn
app.use("/api/auth", authRouter);
app.use("/api/CanNangVaBMI", Them_Ban_Ghi);

// Serve HLS (m3u8 + .ts)
app.use("/hls", express.static(path.join(__dirname, "hls")));

// ===================== FFmpeg CONVERT RTSP -> HLS =====================
let ffmpegProcess = null;

function startFFmpeg() {
  console.log("✔ FFmpeg starting: RTSP → HLS...");

  const args = [
    "-rtsp_transport", "tcp",
    "-i", RTSP_URL,
    "-an",                 // bỏ audio cho nhẹ
    "-c:v", "copy",        // copy codec cho nhẹ CPU
    "-f", "hls",
    "-hls_time", "1",      // 1s/segment
    "-hls_list_size", "5", // giữ 5 segment
    "-hls_flags", "delete_segments+append_list",

    path.join(HLS_OUTPUT_DIR, "index.m3u8"),
  ];

  ffmpegProcess = spawn("ffmpeg", args);

  ffmpegProcess.stderr.on("data", (data) => {
    console.log("[FFmpeg]", data.toString());
  });

  ffmpegProcess.on("close", (code) => {
    console.log("FFmpeg STOPPED, code =", code);
    ffmpegProcess = null;

    // Nếu muốn auto restart lại FFmpeg:
    setTimeout(startFFmpeg, 3000);
  });
}

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5060;

app.listen(PORT, () => {
  console.log(`✔ Server running at http://localhost:${PORT}`);

  // BẮT ĐẦU CHUYỂN ĐỔI RTSP -> HLS
  startFFmpeg();
});
