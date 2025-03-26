import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '../../components/home/Header';
import Navigation from '../../components/home/Navigation';
import Footer from '../../components/home/Footer';
import api from '../../services/api';
import styles from '../../styles/ProductDetail.module.css';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    // Chỉ tải sản phẩm khi có ID
    if (id) {
      const fetchProductDetails = async () => {
        try {
          const data = await api.getProductById(id);
          console.log('Chi tiết sản phẩm:', data);
          setProduct(data);
          setLoading(false);
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
          setError(err.message);
          setLoading(false);
        }
      };
      
      fetchProductDetails();
    }
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const addToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    // Ở đây bạn có thể thêm logic thêm vào giỏ hàng
  };
  
  // Format giá tiền sang VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price * 23000); // Chuyển đổi USD sang VND
  };
  
  // Ánh xạ danh mục tiếng Anh sang tiếng Việt
  const translateCategory = (category) => {
    const categoryMap = {
      "men's clothing": "Thời trang nam",
      "women's clothing": "Thời trang nữ",
      "jewelery": "Trang sức",
      "electronics": "Điện tử"
    };
    
    return categoryMap[category] || category;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-xl mx-auto">
            <p className="font-medium">Lỗi khi tải dữ liệu sản phẩm</p>
            <p>{error || 'Không thể tìm thấy sản phẩm'}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Ảnh sản phẩm */}
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100">
              <div className="relative h-[400px] w-full">
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            
            {/* Thông tin sản phẩm */}
            <div className="md:w-1/2 p-8">
              {/* Danh mục */}
              <div className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-2">
                {translateCategory(product.category)}
              </div>
              
              {/* Tiêu đề */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              {/* Đánh giá */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating_rate || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {product.rating_rate} ({product.rating_count} đánh giá)
                </span>
              </div>
              
              {/* Giá */}
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(product.price)}
              </div>
              
              {/* Tình trạng */}
              <div className="flex items-center mb-4">
                <span className="font-medium text-gray-700 mr-2">Tình trạng:</span>
                <span className="text-green-600 font-semibold">Còn hàng</span>
              </div>
              
              {/* Mô tả */}
              <div className="text-gray-700 mb-8 leading-relaxed">
                {product.description}
              </div>
              
              {/* Số lượng */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                  Số lượng
                </label>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="bg-gray-200 px-3 py-2 rounded-l-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center py-2 border-t border-b border-gray-300"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Nút thêm vào giỏ hàng */}
              <button
                onClick={addToCart}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 