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

async function toggleWishlistHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId } = req.body;
    const userId = req.userId;
    
    // Lấy connection từ pool
    const pool = await getConnection();

    // Kiểm tra sản phẩm tồn tại
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    const [wishlistItems] = await pool.query(
      'SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    let action;

    // Nếu sản phẩm đã có trong danh sách yêu thích, xóa đi
    if (wishlistItems.length > 0) {
      await pool.query(
        'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      action = "removed";
    } else {
      // Nếu sản phẩm chưa có trong danh sách yêu thích, thêm mới
      await pool.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      action = "added";
    }

    return res.status(200).json({
      success: true,
      action: action,
      message: action === "added" 
        ? "Đã thêm sản phẩm vào danh sách yêu thích" 
        : "Đã xóa sản phẩm khỏi danh sách yêu thích"
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
}

export default requireAuth(toggleWishlistHandler); 