import mysql from 'mysql2/promise';
import { requireAuth } from '../middleware';

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

async function getWishlistHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.userId;
    
    // Lấy connection từ pool
    const pool = await getConnection();

    // Lấy tất cả sản phẩm trong danh sách yêu thích của người dùng
    const [wishlistItems] = await pool.query(`
      SELECT w.id, w.product_id as productId, p.title, p.price, p.image, p.rating_rate, p.rating_count, p.category
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [userId]);

    return res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
}

export default requireAuth(getWishlistHandler); 