export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Kiểm tra xác thực người dùng
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để sử dụng chức năng này' });
  }

  try {
    const { productId } = req.query;
    
    // Trong môi trường thử nghiệm - trả về giỏ hàng trống sau khi xóa
    return res.status(200).json({
      id: 1,
      userId: 1,
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
} 