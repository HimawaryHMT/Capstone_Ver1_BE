import poolMySQL from '../../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";


const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

const login = async (req, res) => {
    const { identifier, password } = req.body; // ✅ Sửa lỗi chính tả ở đây

    console.log('Đăng nhập với:', identifier);
    console.log('Password attempt:', password);

    try {
        // Kiểm tra nếu là email hay số điện thoại
        const isEmail = identifier.includes('@');
        const query = isEmail
            ? 'SELECT * FROM users WHERE email = ?'
            : 'SELECT * FROM users WHERE phone = ?';

        const [rows] = await poolMySQL.execute(query, [identifier]);

        // Kiểm tra xem user có tồn tại không
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Sai Email/Số điện thoại hoặc mật khẩu' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash.toString());

        // Kiểm tra xem status có phải là 1 (active) không
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai Email/Số điện thoại hoặc mật khẩu' });
        }


        // Tạo token (đừng đưa password_hash vào payload)
    const payload = {
      user_id: user.user_id , // tuỳ cột khoá chính của bạn
      email: user.email,
      phone: user.phone,
    };
    const token = signToken(payload);

    // ✅ Chỉ gửi dữ liệu cần thiết về FE
    const safeUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status
    };

        // Đăng nhập thành công + Trả về token
    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: safeUser,
    });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


 

export { login };
