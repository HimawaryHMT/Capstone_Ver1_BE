import poolMySQL from "../../config/database.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
    const conn = await poolMySQL.getConnection();
    await conn.beginTransaction();

    async function generateId(conn, table, column, prefix) {
        const [rows] = await conn.query(
            `SELECT MAX(CAST(SUBSTRING(${column}, LENGTH(?) + 2) AS UNSIGNED)) AS maxId
     FROM ${table}`,
            [prefix]
        );
        const next = (rows[0].maxId || 0) + 1;
        return `${prefix}-${String(next).padStart(3, "0")}`;
    }

    try {
        const { fullName, email, phone, password, confirmPassword, cameraAddress, braceletAddress } = req.body;
        // 1. Check email
        const [emailCheck] = await conn.query(
            "SELECT user_id FROM USERs WHERE email = ?",
            [email]
        );
        if (emailCheck.length > 0) {
            return res.status(409).json({ message: "Email đã tồn tại" });
        }

        // 2. Check phone
        const [phoneCheck] = await conn.query(
            "SELECT user_id FROM USERs WHERE phone = ?",
            [phone]
        );
        if (phoneCheck.length > 0) {
            return res.status(409).json({ message: "SĐT đã tồn tại" });
        }
        if (!cameraAddress || !braceletAddress) {
            return res.status(400).json({ message: "Thiếu serial number thiết bị" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải >= 6 ký tự" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu xác nhận không đúng" });
        }
        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Tạo IDs theo prefix
        // ---------------------------
        const userId = await generateId(conn, "USERs", "user_id", "u");
        const cameraId = await generateId(conn, "DEVICEs", "device_id", "dc");
        const braceletId = await generateId(conn, "DEVICEs", "device_id", "dj");
        const regIdCam = await generateId(conn, "DEVICE_REGISTRATIONs", "reg_id", "rc");
        const regIdJel = await generateId(conn, "DEVICE_REGISTRATIONs", "reg_id", "rj");

        // 4. Insert USER
        await conn.query(
            `INSERT INTO USERs (user_id, full_name, phone, email, password_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'inactive', NOW(3))`,
            [userId, fullName, phone, email, passwordHash]
        );

        // 5. Insert devices
        await conn.query(
            `INSERT INTO DEVICEs (device_id, device_type, serial_number, owner_user_id, requested_by_user_id, status)
       VALUES (?, 'CAMERA', ?, NULL, ?, 'pending')`,
            [cameraId, cameraAddress, userId]
        );

        await conn.query(
            `INSERT INTO DEVICEs (device_id, device_type, serial_number, owner_user_id, requested_by_user_id, status)
       VALUES (?, 'JEWELRY', ?, NULL, ?, 'pending')`,
            [braceletId, braceletAddress, userId]
        );

        // 6. Insert device registrations
        await conn.query(
            `INSERT INTO DEVICE_REGISTRATIONs (reg_id, user_id, device_id, status, note, created_at)
       VALUES (?, ?, ?, 'pending', 'Dang cho duyet', NOW(3))`,
            [regIdCam, userId, cameraId]
        );

        await conn.query(
            `INSERT INTO DEVICE_REGISTRATIONs (reg_id, user_id, device_id, status, note, created_at)
       VALUES (?, ?, ?, 'pending', 'Dang cho duyet', NOW(3))`,
            [regIdJel, userId, braceletId]
        );

        // 7. Commit
        await conn.commit();
        conn.release();

        // Log thông tin đăng ký thành công
        console.log("USER REGISTERED SUCCESSFULLY");
        console.log("User ID:", userId);
        console.log("Full Name:", fullName);
        console.log("Email:", email);
        console.log("Phone:", phone);
        console.log("Camera Serial:", cameraAddress);
        console.log("Bracelet Serial:", braceletAddress);

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            user: {
                user_id: userId,
                full_name: fullName,
                email: email,
                phone: phone
            },
            devices: {
                camera: {
                    device_id: cameraId,
                    serial_number: cameraAddress,
                    status: "pending"
                },
                bracelet: {
                    device_id: braceletId,
                    serial_number: braceletAddress,
                    status: "pending"
                }
            },
            registrations: {
                camera: regIdCam,
                bracelet: regIdJel
            }
        });

    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error("REGISTER ERROR:", err);
        return res.status(500).json({ message: "Lỗi server", err });
    }
};

export { register };