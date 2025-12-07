// src/controllers/fallEventController.js
import db from "../config/database.js";

export const createFallEvent = async (req, res) => {
  try {
    const {
      event_id,
      elderly_id,
      device_id,
      detectedAt,
      snapshotUrl,
      videoUrl
    } = req.body;

    console.log("📥 [API] New fall event received:");
    console.log(JSON.stringify(req.body, null, 2));

    // ===== VALIDATE =====
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "videoUrl is required",
      });
    }

    // Convert detectedAt nếu có, nếu không thì lấy NOW()
    const detectedTime = detectedAt
      ? new Date(detectedAt)
      : new Date();

    // ===== SQL INSERT =====
    const sql = `
      INSERT INTO fall_events
      (event_id, elderly_id, device_id, video_url, snapshot_url, detected_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      event_id || null,
      elderly_id || null,
      device_id || null,
      videoUrl,
      snapshotUrl || null,
      detectedTime,
    ];

    const [result] = await db.execute(sql, values);

    const savedEvent = {
      id: result.insertId,
      event_id,
      elderly_id,
      device_id,
      videoUrl,
      snapshotUrl,
      detectedAt: detectedTime
    };

    // 🟢🔥 EMIT REALTIME CHÍNH TẠI ĐÂY
    if (req.io) {
      req.io.emit("new_fall_event", savedEvent);
      console.log("📡 [SOCKET] new_fall_event emitted!");
    } else {
      console.log("⚠️ req.io not found — socket not emitted");
    }

    return res.status(201).json({
      success: true,
      message: "Fall event saved successfully",
      data: savedEvent,
    });

  } catch (error) {
    console.error("❌ [API] Error handling fall event:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllFallEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM fall_events ORDER BY detected_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
