// src/repositories/ProductRepository.js

export class ProductRepository {
  async getAllProducts() {
    try {
      console.log('Đang gọi API: http://localhost:8080/public/api/products');
      
      // Sử dụng endpoint public mới 
      const response = await fetch('http://localhost:8080/public/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit', // Không gửi credentials
        mode: 'cors', // Yêu cầu CORS
        cache: 'no-cache' // Không cache kết quả
      });
      
      console.log('Phản hồi từ API:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Server response:', response.status, response.statusText);
        throw new Error(`Không thể tải sản phẩm từ API (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Dữ liệu nhận từ API:', data);
      return data;
    } catch (error) {
      console.error('Chi tiết lỗi API:', error);
      throw new Error('Lỗi khi tải dữ liệu sản phẩm: ' + error.message);
    }
  }
}
