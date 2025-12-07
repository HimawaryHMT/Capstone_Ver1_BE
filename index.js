import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import http from "http";
import { Server } from "socket.io";

import authRouter from "./src/routers/authRouter.js";
import Them_Ban_Ghi from "./src/routers/CanNangVaBMI/Them_Ban_Ghi.js";
import fallEventRoutes from "./src/routers/fallEventRoutes.js";

dotenv.config();

// ===================== CONFIG PATH =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== CONFIG CAMERA =====================
const RTSP_URL = "rtsp://admin:thang05112004@192.168.100.3:554/ch1/sub"; 
const HLS_OUTPUT_DIR = path.join(__dirname, "hls", "cam1");

// ===================== EXPRESS APP =====================
const app = express();
app.use(cors());
app.use(express.json());

// ===================== SOCKET.IO SETUP =====================
// 🔥 phải tạo HTTP server để gắn socket.io
const server = http.createServer(app);

// 🔥 socket.io server chung
const io = new Server(server, {
  cors: {
    origin: "*", // Dành cho Expo Go / Emulator
    credentials: true,
  },
});

// 🔥 middleware: gắn io vào req để controller dùng emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔌 Khi có client kết nối vào socket
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ===================== ROUTES =====================
app.use("/api/auth", authRouter);
app.use("/api/CanNangVaBMI", Them_Ban_Ghi);
app.use("/api/fall-events", fallEventRoutes);

// serve HLS (m3u8 + .ts)
app.use("/hls", express.static(path.join(__dirname, "hls")));

// ===================== FFmpeg CONVERT RTSP → HLS =====================
let ffmpegProcess = null;

function startFFmpeg() {
  console.log("✔ FFmpeg starting: RTSP → HLS...");

  const args = [
    "-rtsp_transport", "tcp",
    "-i", RTSP_URL,
    "-an",
    "-c:v", "copy",
    "-f", "hls",
    "-hls_time", "1",
    "-hls_list_size", "5",
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

    setTimeout(startFFmpeg, 3000);
  });
}

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5060;

server.listen(PORT, () => {
  console.log(`✔ Server + Socket.io running at http://localhost:${PORT}`);

  // chạy FFmpeg
  startFFmpeg();
});
