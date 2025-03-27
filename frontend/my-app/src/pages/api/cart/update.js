export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Kiểm tra xác thực người dùng
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để sử dụng chức năng này' });
  }

  try {
    const { productId, quantity } = req.body;
    
    // Trong môi trường thử nghiệm - trả về giỏ hàng mẫu sau khi cập nhật
    return res.status(200).json({
      id: 1,
      userId: 1,
      items: [
        {
          id: 1,
          productId: productId,
          productName: "Sản phẩm thử nghiệm",
          productImage: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
          price: 100000,
          quantity: quantity
        }
      ],
      total: 100000 * quantity
    });
  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
} 