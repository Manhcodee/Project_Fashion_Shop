import React, { useState, useEffect } from 'react';
import Header from '../components/home/Header';
import Navigation from '../components/home/Navigation';
import ProductCard from '../components/home/ProductCard';
import Footer from '../components/home/Footer';
import { ProductRepository } from '../repositories/ProductRepository';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRepo = new ProductRepository();
        const data = await productRepo.getAllProducts();
        
        setProducts(data);
        
        // Lọc sản phẩm bán chạy (dựa trên rating)
        const sortedByRating = [...data].sort((a, b) => (b.rating_rate || 0) - (a.rating_rate || 0));
        setBestSellers(sortedByRating.slice(0, 5));
        
        // Lọc sản phẩm mới (dựa trên id)
        const sortedById = [...data].sort((a, b) => b.id - a.id);
        setNewProducts(sortedById.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="hero bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl shadow-lg p-12 mb-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Chào mừng đến với Fashion Shop</h1>
          <p className="text-xl opacity-90">Khám phá bộ sưu tập thời trang mới nhất của chúng tôi</p>
        </div>

        {/* Best Sellers Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả →
            </a>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* New Products Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm mới</h2>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả →
            </a>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* All Products Section */}
        <section>
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tất cả sản phẩm</h2>
            <select className="form-select rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 w-48">
              <option>Mới nhất</option>
              <option>Giá: Thấp đến cao</option>
              <option>Giá: Cao đến thấp</option>
              <option>Đánh giá cao nhất</option>
            </select>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
