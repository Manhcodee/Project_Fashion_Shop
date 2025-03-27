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

  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
  }

  try {
    // Lấy connection từ pool
    const pool = await getConnection();
    
    // Thực hiện query lấy chi tiết sản phẩm
    const [products] = await pool.query(`
      SELECT id, title, price, description, category, image, 
             rating_rate, rating_count, is_featured, is_new,
             created_at, updated_at
      FROM products
      WHERE id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    return res.status(200).json(products[0]);

  } catch (error) {
    console.error('Database error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server khi truy vấn database',
      error: error.message 
    });
  }
} 