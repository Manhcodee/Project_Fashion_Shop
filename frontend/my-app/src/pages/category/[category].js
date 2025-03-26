import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/home/Header';
import Navigation from '../../components/home/Navigation';
import ProductCard from '../../components/home/ProductCard';
import Footer from '../../components/home/Footer';
import api from '../../services/api';
import styles from '../../styles/Category.module.css';

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  
  // Dịch danh mục từ tiếng Anh sang tiếng Việt
  const getCategoryName = (categorySlug) => {
    const categories = {
      'electronics': 'Thiết bị điện tử',
      'jewelery': 'Trang sức',
      'mens-clothing': "Thời trang nam",
      'womens-clothing': "Thời trang nữ",
      'sale': 'Giảm giá',
      'new-arrivals': 'Sản phẩm mới',
      'featured': 'Sản phẩm nổi bật',
      'gifts': 'Quà tặng'
    };
    return categories[categorySlug] || categorySlug;
  };
  
  useEffect(() => {
    // Chỉ tải sản phẩm khi có category
    if (category) {
      setLoading(true);
      setError(null);
      
      const fetchCategoryProducts = async () => {
        try {
          let data = [];
          console.log('Đang tải danh mục:', category);
          
          // Xử lý riêng cho các loại danh mục đặc biệt
          if (category === 'new-arrivals') {
            data = await api.getNewProducts();
          } else if (category === 'featured') {
            data = await api.getFeaturedProducts();
          } else if (category === 'sale') {
            // Giả định: API không có sản phẩm sale, nên lấy tất cả sản phẩm
            data = await api.getAllProducts();
            // Lọc sản phẩm giả định giảm giá (ví dụ: 20% sản phẩm có rating thấp nhất)
            data = data.sort((a, b) => a.rating_rate - b.rating_rate).slice(0, Math.ceil(data.length * 0.2));
          } else if (category === 'gifts') {
            // Giả định: Quà tặng là một số sản phẩm ngẫu nhiên
            data = await api.getAllProducts();
            // Lấy 4 sản phẩm ngẫu nhiên
            data = data.sort(() => 0.5 - Math.random()).slice(0, 4);
          } else {
            // Chuyển đổi slug sang category name trong API
            let apiCategory = category;
            if (category === 'mens-clothing') apiCategory = "men's clothing";
            if (category === 'womens-clothing') apiCategory = "women's clothing";
            
            data = await api.getProductsByCategory(apiCategory);
          }
          
          console.log(`Sản phẩm trong danh mục ${category}:`, data);
          
          if (!data || !Array.isArray(data)) {
            console.warn(`Dữ liệu không hợp lệ cho danh mục ${category}`);
            data = [];
          }
          
          setProducts(data);
          setLoading(false);
        } catch (err) {
          console.error(`Lỗi khi tải sản phẩm danh mục ${category}:`, err);
          setError(err.message);
          setLoading(false);
          
          // Fallback: Thử lấy tất cả sản phẩm và lọc theo danh mục (front-end filtering)
          try {
            console.log('Đang thử phương pháp fallback...');
            const allProducts = await api.getAllProducts();
            if (allProducts && Array.isArray(allProducts)) {
              // Lọc sản phẩm dựa trên category
              let filteredProducts = [];
              
              if (category === 'mens-clothing') {
                filteredProducts = allProducts.filter(p => p.category === "men's clothing");
              } else if (category === 'womens-clothing') {
                filteredProducts = allProducts.filter(p => p.category === "women's clothing");
              } else if (category === 'new-arrivals') {
                filteredProducts = allProducts.filter(p => p.is_new === true || p.isNew === true);
              } else if (category === 'featured') {
                filteredProducts = allProducts.filter(p => p.is_featured === true || p.isFeatured === true);
              } else {
                filteredProducts = allProducts.filter(p => 
                  p.category && p.category.toLowerCase().includes(category.toLowerCase())
                );
              }
              
              if (filteredProducts.length > 0) {
                console.log('Phương pháp fallback thành công:', filteredProducts.length, 'sản phẩm');
                setProducts(filteredProducts);
                setError(null);
              }
            }
          } catch (fallbackErr) {
            console.error('Fallback cũng thất bại:', fallbackErr);
          }
        }
      };
      
      fetchCategoryProducts();
    }
  }, [category]);
  
  // Sắp xếp sản phẩm
  const sortProducts = (option) => {
    let sortedProducts = [...products];
    
    switch (option) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sortedProducts.sort((a, b) => (b.rating_rate || 0) - (a.rating_rate || 0));
        break;
      case 'newest':
        // Giả định sản phẩm mới nhất có ID cao nhất
        sortedProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        // Mặc định không sắp xếp
        break;
    }
    
    setProducts(sortedProducts);
    setSortOption(option);
  };
  
  const handleSortChange = (e) => {
    const option = e.target.value;
    sortProducts(option);
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{getCategoryName(category)} | Fashion Shop</title>
      </Head>
      
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tiêu đề trang */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getCategoryName(category)}
          </h1>
          <p className="text-gray-600">
            {products.length} sản phẩm
          </p>
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 p-2 rounded">
              Đã xảy ra lỗi: {error}. Hiển thị kết quả có sẵn.
            </div>
          )}
        </div>
        
        {/* Thanh điều khiển */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          {/* Bộ lọc (phần mở rộng trong tương lai) */}
          <div>
            <button className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Lọc
            </button>
          </div>
          
          {/* Sắp xếp */}
          <div className="flex items-center">
            <span className="mr-2 text-gray-700">Sắp xếp:</span>
            <select 
              value={sortOption}
              onChange={handleSortChange}
              className="form-select rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="default">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
        
        {/* Danh sách sản phẩm */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
            <p className="mt-2 text-gray-500">Chúng tôi hiện không có sản phẩm nào trong danh mục này.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Quay lại trang chủ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 