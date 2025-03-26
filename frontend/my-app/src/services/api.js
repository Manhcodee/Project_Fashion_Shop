// API base URL
const API_BASE_URL = 'http://localhost:8080';

// API endpoints
const ENDPOINTS = {
  PRODUCTS: '/public/api/products',
  PRODUCT_DETAIL: (id) => `/public/api/products/${id}`,
  FEATURED_PRODUCTS: '/public/api/products/featured',
  NEW_PRODUCTS: '/public/api/products/new',
  CATEGORY_PRODUCTS: (category) => `/public/api/products/category/${category}`,
};

// Timeout cho API request
const TIMEOUT_DURATION = 15000; // 15 giây

// Hàm tạo timeout promise
const timeoutPromise = (ms) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
};

// Hàm trợ giúp để gọi API
const fetchFromApi = async (endpoint, options = {}) => {
  try {
    console.log(`Đang gọi API: ${API_BASE_URL}${endpoint}`);
    
    // Race giữa fetch và timeout
    const response = await Promise.race([
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        credentials: 'omit', // Không gửi credentials
        mode: 'cors', // Yêu cầu CORS
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-cache',
      }),
      timeoutPromise(TIMEOUT_DURATION)
    ]);

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Console log để debug
    const text = await response.text();
    console.log('API response text:', text);
    
    try {
      // Nếu response là JSON hợp lệ
      const data = text ? JSON.parse(text) : {};
      console.log('API data parsed:', data);
      return data;
    } catch (parseError) {
      // Nếu không phải JSON, trả về text
      console.error('JSON parsing error:', parseError);
      return { error: 'Invalid JSON response', text };
    }
  } catch (error) {
    console.error('API call failed:', error);
    if (error.message === 'Request timeout') {
      console.error('API request timed out after', TIMEOUT_DURATION, 'ms');
    }
    throw error;
  }
};

// Fallback data in case API fails
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Fjallraven - Foldsack No. 1 Backpack",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    rating_rate: 3.9,
    rating_count: 120,
    is_featured: true,
    is_new: false
  },
  {
    id: 2,
    title: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating_rate: 4.1,
    rating_count: 259,
    is_featured: false,
    is_new: true
  }
];

// API functions with fallback
const api = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    try {
      return await fetchFromApi(ENDPOINTS.PRODUCTS);
    } catch (error) {
      console.warn('Falling back to local data for getAllProducts');
      return FALLBACK_PRODUCTS;
    }
  },
  
  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    try {
      return await fetchFromApi(ENDPOINTS.PRODUCT_DETAIL(id));
    } catch (error) {
      console.warn(`Falling back to local data for product ID ${id}`);
      return FALLBACK_PRODUCTS.find(p => p.id === Number(id)) || FALLBACK_PRODUCTS[0];
    }
  },
  
  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async () => {
    try {
      return await fetchFromApi(ENDPOINTS.FEATURED_PRODUCTS);
    } catch (error) {
      console.warn('Falling back to local data for featured products');
      return FALLBACK_PRODUCTS.filter(p => p.is_featured);
    }
  },
  
  // Lấy sản phẩm mới
  getNewProducts: async () => {
    try {
      return await fetchFromApi(ENDPOINTS.NEW_PRODUCTS);
    } catch (error) {
      console.warn('Falling back to local data for new products');
      return FALLBACK_PRODUCTS.filter(p => p.is_new);
    }
  },
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (category) => {
    try {
      return await fetchFromApi(ENDPOINTS.CATEGORY_PRODUCTS(category));
    } catch (error) {
      console.warn(`Falling back to local data for category ${category}`);
      return FALLBACK_PRODUCTS.filter(p => p.category === category);
    }
  },
};

export default api; 