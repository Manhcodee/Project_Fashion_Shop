export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, fullName } = req.body;
    
    // Giả lập đăng ký thành công
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        id: 2,
        email,
        fullName,
        role: 'USER'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
} 