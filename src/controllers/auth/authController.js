import poolMySQL from '../../config/database.js';

const login = async (req, res) => {
        // Extract username and password from request body
    const { email, password } = req.body;

    // Log the received email and password for debugging
    console.log ('Email/password attempt:', email);
    console.log ('Password attempt:', password);

    try {
        const [rows] = await poolMySQL.execute(
            'SELECT * FROM admins WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {  
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export { login };