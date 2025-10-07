import poolMySQL from '../../config/database.js';
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
  const { identifier, password } = req.body; // ✅ Sửa lỗi chính tả ở đây

  console.log('Đăng nhập với:', identifier);
  console.log('Password attempt:', password);

  try {
    // Kiểm tra nếu là email hay số điện thoại
    const isEmail = identifier.includes('@');

    // Truy vấn linh hoạt theo loại identifier
    const query = isEmail
      ? 'SELECT * FROM admins WHERE email = ?'
      : 'SELECT * FROM admins WHERE phone = ?';

    const [rows] = await poolMySQL.execute(query, [identifier]);

    // Kiểm tra xem user có tồn tại không
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Sai Email/Số điện thoại hoặc mật khẩu' });
    }

    const user = rows[0];

    // So sánh mật khẩu người dùng nhập với hash trong DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Sai Email/Số điện thoại hoặc mật khẩu' });
    }

    // Đăng nhập thành công
    res.status(200).json({ message: 'Đăng nhập thành công', user });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export { login };
