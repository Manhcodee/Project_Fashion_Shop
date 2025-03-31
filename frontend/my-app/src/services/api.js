import axios from 'axios';
import { toast } from 'react-toastify';

// Thay đổi URL API để sử dụng API local của Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi 401 và 403
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401 || status === 403) {
        // Xóa thông tin đăng nhập
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Thông báo cho người dùng
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          autoClose: 3000,
          pauseOnHover: true
        });
        
        // Chuyển hướng sau 2 giây nếu không ở trang đăng nhập
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/sign-in')) {
          setTimeout(() => {
            window.location.href = '/sign-in';
          }, 2000);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API functions
const apiService = {
  // Auth APIs
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data?.token) {
        // Lưu token và user data
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: (userData) => api.post('/auth/register', userData),
  verifyAccount: (code) => api.post('/auth/verify', { code }),
  
  // Product APIs
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getNewProducts: () => api.get('/products/new'),
  searchProducts: (query) => api.get(`/products/search?q=${query}`),
  
  // Cart APIs
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (data) => api.put('/cart/update', data),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  
  // Wishlist APIs
  getWishlist: () => api.get('/wishlist'),
  toggleWishlistItem: (data) => api.post('/wishlist/toggle', data),
  
  // Kiểm tra trạng thái đăng nhập
  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    try {
      // Kiểm tra token có hợp lệ không
      const userData = JSON.parse(user);
      if (!userData) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  }
};

export default apiService; 