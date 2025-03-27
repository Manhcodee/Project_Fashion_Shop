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

async function addToCartHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;
    
    // Lấy connection từ pool
    const pool = await getConnection();

    // Kiểm tra sản phẩm tồn tại
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra giỏ hàng đã tồn tại
    let [carts] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    let cartId;

    // Nếu chưa có giỏ hàng, tạo mới
    if (carts.length === 0) {
      const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const [cartItems] = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
    if (cartItems.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cartId, productId]
      );
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }

    // Lấy thông tin giỏ hàng đã cập nhật
    const [updatedCartItems] = await pool.query(`
      SELECT ci.id, ci.product_id as productId, ci.quantity, 
             p.title as productName, p.image as productImage, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    // Tính tổng tiền
    const total = updatedCartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    return res.status(200).json({
      id: cartId,
      userId: userId,
      items: updatedCartItems,
      total: total
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
}

export default requireAuth(addToCartHandler); 