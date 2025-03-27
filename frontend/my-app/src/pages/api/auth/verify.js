export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    
    // Giả lập xác thực thành công nếu mã là 123456
    if (code === '123456') {
      return res.status(200).json({
        success: true,
        message: 'Xác thực tài khoản thành công'
      });
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Mã xác thực không đúng hoặc đã hết hạn' 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
} 