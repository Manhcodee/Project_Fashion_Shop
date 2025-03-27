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

async function getCartHandler(req, res) {
  try {
    const userId = req.userId;
    
    // Lấy connection từ pool
    const pool = await getConnection();

    // Kiểm tra giỏ hàng đã tồn tại
    let [carts] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    
    // Nếu chưa có giỏ hàng, trả về giỏ hàng trống
    if (carts.length === 0) {
      return res.status(200).json({
        id: null,
        userId: userId,
        items: [],
        total: 0
      });
    }
    
    const cartId = carts[0].id;

    // Lấy thông tin các sản phẩm trong giỏ hàng
    const [cartItems] = await pool.query(`
      SELECT ci.id, ci.product_id as productId, ci.quantity, 
             p.title as productName, p.image as productImage, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    // Tính tổng tiền
    const total = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    return res.status(200).json({
      id: cartId,
      userId: userId,
      items: cartItems,
      total: total
    });
  } catch (error) {
    console.error('Database error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server khi truy vấn database',
      error: error.message 
    });
  }
}

// Sử dụng middleware xác thực
export default requireAuth(getCartHandler); 