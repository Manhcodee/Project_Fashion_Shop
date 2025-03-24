import { toast } from 'react-toastify';

const API_URL = 'http://localhost:8080/api';

// Hàm chung để thực hiện API request
export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
    
    // Kiểm tra nếu token hết hạn hoặc không hợp lệ
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Có lỗi xảy ra');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Các hàm tiện ích
export const get = (endpoint) => fetchApi(endpoint, { method: 'GET' });
export const post = (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const del = (endpoint) => fetchApi(endpoint, { method: 'DELETE' });
