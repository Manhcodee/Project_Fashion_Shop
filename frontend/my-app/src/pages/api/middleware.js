import { jwtVerify } from 'jose';

// Middleware xác thực người dùng

/**
 * Lấy ID người dùng từ token (được đơn giản hóa cho mục đích test)
 * 
 * @param {object} req - Request object từ Next.js
 * @returns {number|null} - User ID hoặc null nếu không xác thực được
 */
export function getUserIdFromToken(req) {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ Không tìm thấy token trong header");
      return null;
    }

    // Lấy token từ header (bỏ phần "Bearer ")
    const token = authHeader.substring(7);
    
    console.log("🔑 Đang xác thực token:", token);
    
    // Đơn giản hóa: Kiểm tra xem token có chứa chuỗi "simple-test-token" hay không
    if (token.includes('simple-test-token')) {
      console.log("✅ Token hợp lệ, cấp quyền truy cập");
      
      // Trả về user ID giả định là 1 cho mục đích test
      return 1;
    }
    
    console.log("❌ Token không hợp lệ");
    return null;
  } catch (error) {
    console.error("❌ Lỗi xác thực token:", error);
    return null;
  }
}

/**
 * Middleware yêu cầu xác thực
 * 
 * @param {Function} handler - API handler function
 * @returns {Function} - Wrapped handler với xác thực
 */
export function requireAuth(handler) {
  return async (req, res) => {
    console.log("👮‍♂️ Kiểm tra xác thực cho route:", req.url);
    
    // Lấy user ID từ token
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      console.log("🚫 Từ chối truy cập, yêu cầu đăng nhập");
      return res.status(401).json({ message: 'Bạn cần đăng nhập để sử dụng tính năng này' });
    }
    
    // Gán user ID vào request để các handler có thể sử dụng
    req.userId = userId;
    console.log("✅ Xác thực thành công cho user ID:", userId);
    
    // Chuyển đến handler tiếp theo
    return handler(req, res);
  };
} 