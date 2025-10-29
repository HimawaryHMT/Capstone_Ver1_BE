
import mysql from 'mysql2/promise';

const poolMySQL = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MinhThang@2022',
  database: 'elderly_monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔍 Kiểm tra kết nối
(async () => {
  try {
    const connection = await poolMySQL.getConnection();
    console.log('✅ Connected to the MySQL database.');
    connection.release(); // Trả connection lại pool
  } catch (err) {
    console.error('❌ Error connecting to the database:', err.message);
  }
})();

export default poolMySQL;


        /* Alternative connection method
/*
import mysql from 'mysql2/promise';

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'MinhThang@2022',
            database: 'capstone_ver1'
        });
        console.log('Connected to the database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

connectToDatabase().then((connection) => {
    // You can perform further operations with the connection
    connection.end();
});

*/