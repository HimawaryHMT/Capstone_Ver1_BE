import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gắn thông tin user (ví dụ: user_id) vào req
    next(); // Cho phép đi tiếp đến controller
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};