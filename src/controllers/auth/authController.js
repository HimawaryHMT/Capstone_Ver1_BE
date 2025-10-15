import poolMySQL from '../../config/database.js';
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
    const { identifier, password } = req.body; // ✅ Sửa lỗi chính tả ở đây

    console.log('Đăng nhập với:', identifier);
    console.log('Password attempt:', password);

    try {
        // Kiểm tra nếu là email hay số điện thoại
        const isEmail = identifier.includes('@');
        const query = isEmail
            ? 'SELECT * FROM admins WHERE email = ?'
            : 'SELECT * FROM admins WHERE phone = ?';

        const [rows] = await poolMySQL.execute(query, [identifier]);

        // Kiểm tra xem user có tồn tại không
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Sai Email/Số điện thoại hoặc mật khẩu' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        // Kiểm tra xem status có phải là 1 (active) không

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


const register = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, CD_physicalAddress, JD_physicalAddress } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword || !CD_physicalAddress || !JD_physicalAddress) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Kiểm tra email và số điện thoại đã tồn tại chưa 
        const [existingUsers] = await poolMySQL.execute(
            'SELECT * FROM admins WHERE email = ? OR phone = ?',
            [email, phone]
        );
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email hoặc số điện thoại đã được sử dụng' });
        }

        // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu và xác nhận mật khẩu không khớp' });
        }

        // Mã hóa mật khẩu
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Thêm người dùng mới vào cơ sở dữ liệu 
        const [result] = await poolMySQL.execute(
            'INSERT INTO users (name, email, phone, password, CD_physicalAddress, JD_physicalAddress) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, CD_physicalAddress, JD_physicalAddress]
        );

        res.status(201).json({
            message: 'Đăng ký thành công, vui lòng chờ xác minh của admin',
            userId: result.insertId,
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};



export { login, register };
