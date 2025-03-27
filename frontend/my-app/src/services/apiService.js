import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Thêm interceptor cho request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thử refresh token
        await apiService.refreshToken();
        
        // Thử lại request ban đầu với token mới
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Chuyển hướng về trang đăng nhập nếu không ở trang đăng nhập
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
        }
      }
    }

    // Nếu lỗi 403 hoặc các lỗi khác
    if (error.response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

const apiService = {
  // Phương thức đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data); // Thêm log để debug

      // Kiểm tra cấu trúc response
      if (response.data && response.data.accessToken) {
        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.accessToken);
        
        // Lưu refresh token nếu có
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Tạo object user từ response data
        const userData = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role,
          verified: response.data.verified
        };
        
        // Lưu user data
        localStorage.setItem('user', JSON.stringify(userData));

        // Thêm token vào header mặc định cho các request tiếp theo
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;

        // Gửi request để lưu token vào database
        try {
          await api.post('/auth/save-token', {
            userId: userData.id,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiry: response.data.tokenExpiry
          });
        } catch (saveTokenError) {
          console.error('Error saving token to database:', saveTokenError);
        }
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Phương thức refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!refreshToken || !userData) {
        throw new Error('No refresh token or user data found');
      }

      const response = await api.post('/auth/refresh-token', { 
        userId: userData.id,
        refreshToken: refreshToken 
      });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;

        // Gửi request để cập nhật token mới trong database
        try {
          await api.post('/auth/save-token', {
            userId: userData.id,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiry: response.data.tokenExpiry
          });
        } catch (saveTokenError) {
          console.error('Error saving refreshed token to database:', saveTokenError);
        }
      }

      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Phương thức kiểm tra trạng thái xác thực
  checkAuthStatus: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/auth/verify-token');
      
      // Kiểm tra response có hợp lệ không
      if (!response.data) {
        throw new Error('Invalid response from verify-token');
      }

      return response;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Phương thức đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  },

  // Phương thức quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức đặt lại mật khẩu
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức xác thực email
  verifyEmail: async (data) => {
    try {
      const response = await api.post('/auth/verify-email', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức lấy thông tin giỏ hàng
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức lấy thông tin wishlist
  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức lấy sản phẩm
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức lấy sản phẩm nổi bật
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phương thức lấy sản phẩm mới
  getNewProducts: async () => {
    try {
      const response = await api.get('/products/new');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService; 