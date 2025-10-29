import db from '../../../config/database.js';

const ThemBanGhi = async (req, res) => {
  try {
    const { weight, height } = req.body;


    // Kiểm tra dữ liệu hợp lệ
    if (!weight || !height || weight > 400 || height > 200) {
      return res.status(400).json({ message: "Thiếu thông tin cân nặng hoặc chiều cao" });
    }

    // Đổi chiều cao từ cm => m 
    const heightDaDoi = height / 100

    // Tính BMI
    const bmi = weight / (heightDaDoi * heightDaDoi);

    console.log("✅ Dữ liệu nhận:", { weight, height, bmi });

    // Trả về cho client
    return res.status(201).json({
      message: "Thêm bản ghi thành công",
      data: { weight, height, bmi: bmi.toFixed(2) }
    });

  } catch (error) {
    console.error("❌ Lỗi khi thêm bản ghi:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


const getAll_BMI = async (req, res) => {
  try {
    // Lấy toàn bộ dữ liệu BMI
    const [rows] = await db.query(`
      SELECT bmi, DATE_FORMAT(created_at, '%b') AS month
      FROM cannangvabmis
      ORDER BY created_at ASC
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không có dữ liệu BMI" });
    }

    // Lấy danh sách BMI
    const values = rows.map(row => parseFloat(row.bmi));
    const labels = rows.map(row => row.month);

    // Tính toán thống kê
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (
      values.reduce((sum, v) => sum + v, 0) / values.length
    ).toFixed(1);

    // Gửi kết quả về client
    return res.status(200).json({
      message: "Lấy dữ liệu BMI thành công",
      data: { max, min, avg, values, labels },
    });

  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu BMI:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getAll_CanNang = async (req, res) => {
  try {
    // Lấy toàn bộ dữ liệu BMI
    const [rows] = await db.query(`
      SELECT cannang, DATE_FORMAT(created_at, '%b') AS month
      FROM cannangvabmis
      ORDER BY created_at ASC
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không có dữ liệu BMI" });
    }

    // Lấy danh sách BMI
    const values = rows.map(row => parseFloat(row.cannang));
    const labels = rows.map(row => row.month);

    // Tính toán thống kê
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (
      values.reduce((sum, v) => sum + v, 0) / values.length
    ).toFixed(1);

    // Gửi kết quả về client
    return res.status(200).json({
      message: "Lấy dữ liệu cân nặng thành công",
      data: { max, min, avg, values, labels },
    });

  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu cân nặng :", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export { ThemBanGhi, getAll_BMI, getAll_CanNang };