import { createConnection } from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Phương thức không được hỗ trợ' });
  }

  console.log("🔐 Nhận request đăng nhập:", JSON.stringify(req.body));

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Thiếu email hoặc mật khẩu");
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    // Kết nối đến MySQL database
    const connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fashion_shop'
    });

    console.log("🔌 Đã kết nối database");

    // Tìm kiếm user dựa vào email
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log("🔍 Kết quả tìm kiếm user:", users.length > 0 ? "Tìm thấy user" : "Không tìm thấy user");

    // Kiểm tra nếu user không tồn tại
    if (users.length === 0) {
      await connection.end();
      console.log("❌ User không tồn tại");
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = users[0];

    // Kiểm tra mật khẩu (giả định mật khẩu không mã hóa)
    // Note: Trong môi trường thật, bạn nên sử dụng bcrypt để mã hóa và so sánh mật khẩu
    if (password !== user.password) {
      await connection.end();
      console.log("❌ Mật khẩu không chính xác");
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // Cập nhật thời gian đăng nhập cuối
    await connection.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    console.log("✅ Đăng nhập thành công");

    // Tạo token đơn giản cho mục đích kiểm tra
    const token = "simple-test-token-" + Date.now();
    console.log("🎫 Tạo token thành công:", token);

    // Log chi tiết thông tin user
    console.log("👤 Thông tin user:", {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });

    // Đóng kết nối database
    await connection.end();

    // Gửi phản hồi thành công với token và thông tin user
    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Lỗi xử lý đăng nhập:", error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
  }
} 