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

  console.log('🔍 Đang lấy danh sách sản phẩm...');
  
  try {
    // Lấy connection từ pool
    const pool = await getConnection();
    console.log('✅ Kết nối database thành công');
    
    // Kiểm tra kết nối
    const [testConnection] = await pool.execute('SELECT 1');
    console.log('✅ Test kết nối thành công:', testConnection);
    
    // Thực hiện query
    console.log('🔄 Đang query dữ liệu...');
    const [products] = await pool.query(`
      SELECT id, title, price, description, category, image, 
             rating_rate, rating_count, is_featured, is_new,
             created_at, updated_at
      FROM products
      ORDER BY id DESC
    `);
    console.log(`✅ Lấy được ${products.length} sản phẩm`);

    // Trả về dữ liệu
    return res.status(200).json(products);

  } catch (error) {
    console.error('❌ Database error:', error);
    
    // Xử lý các loại lỗi cụ thể
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Không thể kết nối đến MySQL server');
      return res.status(500).json({ 
        message: 'Không thể kết nối đến database. Vui lòng kiểm tra MySQL server.',
        error: error.message 
      });
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('❌ Bảng products không tồn tại');
      return res.status(500).json({ 
        message: 'Bảng products không tồn tại trong database.',
        error: error.message 
      });
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database fashion_shop không tồn tại');
      return res.status(500).json({ 
        message: 'Database fashion_shop không tồn tại.',
        error: error.message 
      });
    }

    return res.status(500).json({ 
      message: 'Lỗi server khi truy vấn database',
      error: error.message 
    });
  }
} 