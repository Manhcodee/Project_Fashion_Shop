export class ProductRepository {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
  }

  async getAllProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu sản phẩm');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      if (!response.ok) {
        throw new Error('Không thể tải thông tin sản phẩm');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  }

  async getProductsByCategory(category) {
    try {
      const response = await fetch(`${this.baseUrl}/products?category=${category}`);
      if (!response.ok) {
        throw new Error('Không thể tải sản phẩm theo danh mục');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await fetch(`${this.baseUrl}/products/search?q=${query}`);
      if (!response.ok) {
        throw new Error('Không thể tìm kiếm sản phẩm');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  async getTopRatedProducts(limit = 5) {
    try {
      const products = await this.getAllProducts();
      return products
        .sort((a, b) => (b.rating_rate || 0) - (a.rating_rate || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getTopRatedProducts:', error);
      throw error;
    }
  }

  async getNewProducts(limit = 5) {
    try {
      const products = await this.getAllProducts();
      return products
        .sort((a, b) => b.id - a.id)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getNewProducts:', error);
      throw error;
    }
  }
} 