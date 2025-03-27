import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'fashion_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    return pool;
  } catch (error) {
    console.error('Lỗi tạo connection pool:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm' });
  }

  try {
    // Lấy connection từ pool
    const pool = await getConnection();
    
    // Thực hiện query tìm kiếm sản phẩm
    const searchQuery = `%${q}%`;
    const [products] = await pool.query(`
      SELECT id, title, price, description, category, image, 
             rating_rate, rating_count, is_featured, is_new,
             created_at, updated_at
      FROM products
      WHERE 
        title LIKE ? OR 
        description LIKE ? OR
        category LIKE ?
      ORDER BY id DESC
    `, [searchQuery, searchQuery, searchQuery]);

    return res.status(200).json(products);

  } catch (error) {
    console.error('Database error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server khi truy vấn database',
      error: error.message 
    });
  }
} 