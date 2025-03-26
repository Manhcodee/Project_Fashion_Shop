import React, { useState, useEffect } from "react";
import Header from "../components/home/Header";
import Navigation from "../components/home/Navigation";
import ProductCard from "../components/home/ProductCard";
import Footer from "../components/home/Footer";
import Pagination from "../components/common/Pagination";
import api from "../services/api";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 8; // Số sản phẩm mỗi trang
  
  // Sắp xếp
  const [sortOption, setSortOption] = useState('newest');
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy dữ liệu từ API với API service mới
        const [allProducts, featuredProducts, newProductsData] = await Promise.all([
          api.getAllProducts(),
          api.getFeaturedProducts(),
          api.getNewProducts()
        ]);
        
        console.log('Tất cả sản phẩm:', allProducts);
        console.log('Sản phẩm nổi bật:', featuredProducts);
        console.log('Sản phẩm mới:', newProductsData);
        
        if (!allProducts || !Array.isArray(allProducts)) {
          console.error('Lỗi: API không trả về mảng sản phẩm hợp lệ');
          throw new Error('Dữ liệu sản phẩm không hợp lệ');
        }
        
        // Xử lý dữ liệu sản phẩm
        setProducts(allProducts);
        setBestSellers(Array.isArray(featuredProducts) && featuredProducts.length > 0 
          ? featuredProducts 
          : allProducts.slice(0, 4));
        setNewProducts(Array.isArray(newProductsData) && newProductsData.length > 0 
          ? newProductsData 
          : allProducts.slice(0, 4));
        
        // Tính tổng số trang
        setTotalPages(Math.ceil(allProducts.length / productsPerPage));
        
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Áp dụng sắp xếp và cập nhật hiển thị sản phẩm khi products hoặc sortOption thay đổi
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Clone array để không ảnh hưởng đến dữ liệu gốc
    let sortedProducts = [...products];
    
    // Sắp xếp theo lựa chọn
    switch (sortOption) {
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
      default:
        // Mặc định là mới nhất (theo ID)
        sortedProducts.sort((a, b) => b.id - a.id);
        break;
    }
    
    setDisplayProducts(sortedProducts);
    // Reset về trang đầu tiên khi thay đổi sắp xếp
    setCurrentPage(1);
  }, [products, sortOption]);
  
  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu phần sản phẩm
    document.getElementById('all-products').scrollIntoView({ behavior: 'smooth' });
  };
  
  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Lấy sản phẩm cho trang hiện tại
  const getCurrentPageProducts = () => {
    if (!displayProducts || displayProducts.length === 0) return [];
    
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return displayProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };
  
  // Kiểm tra xem mảng có phần tử không
  const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
          <p className="font-medium">Lỗi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Navigation />

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroSectionContent}>
            <h1 className={styles.heroTitle}>
              Khám phá thế giới
              <br />
              <span className={styles.heroHighlight}>
                Thời trang & Công nghệ
              </span>
            </h1>
            <p className={styles.heroDescription}>
              Trải nghiệm những sản phẩm công nghệ mới nhất và phong cách thời
              trang độc đáo
            </p>
            <button className={styles.heroButton}>Khám phá ngay</button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <div className={styles.sectionWrapper}>
            <div className={styles.categoryGrid}>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>👕</div>
                <h3 className={styles.categoryTitle}>Thời trang</h3>
                <p className={styles.categoryDescription}>Quần áo, phụ kiện</p>
              </div>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>💻</div>
                <h3 className={styles.categoryTitle}>Công nghệ</h3>
                <p className={styles.categoryDescription}>
                  Điện thoại, máy tính
                </p>
              </div>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>⌚</div>
                <h3 className={styles.categoryTitle}>Đồng hồ</h3>
                <p className={styles.categoryDescription}>
                  Thông minh & cổ điển
                </p>
              </div>
              <div className={styles.categoryCard}>
                <div className={styles.categoryIcon}>🎮</div>
                <h3 className={styles.categoryTitle}>Gaming</h3>
                <p className={styles.categoryDescription}>
                  Máy chơi game & phụ kiện
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers Section */}
        {hasItems(bestSellers) && (
          <section className="mb-16">
            <div className={styles.sectionWrapper}>
              <div className={styles.bestSellerHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Sản phẩm bán chạy</h2>
                  <p className={styles.sectionSubtitle}>
                    Những sản phẩm được yêu thích nhất
                  </p>
                </div>
                <a href="/category/featured" className={styles.viewAllLink}>
                  Xem tất cả
                  <svg
                    className={`w-5 h-5 ml-2 ${styles.arrowIcon}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
              <div className={styles.productGrid}>
                {bestSellers.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* New Products Section */}
        {hasItems(newProducts) && (
          <section className="mb-16">
            <div className={styles.sectionWrapper}>
              <div className={styles.bestSellerHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Sản phẩm mới</h2>
                  <p className={styles.sectionSubtitle}>
                    Những sản phẩm mới nhất của chúng tôi
                  </p>
                </div>
                <a href="/category/new-arrivals" className={styles.viewAllLink}>
                  Xem tất cả
                  <svg
                    className={`w-5 h-5 ml-2 ${styles.arrowIcon}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
              <div className={styles.productGrid}>
                {newProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section id="all-products" className={`mb-16 ${styles.allProductsSection}`}>
          <div className={styles.bestSellerHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Tất cả sản phẩm</h2>
              <p className={styles.sectionSubtitle}>
                Khám phá toàn bộ sản phẩm đang có
              </p>
            </div>
            <div className={styles.filterBar}>
              <select 
                className="form-select rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 w-48 bg-white shadow-sm"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {hasItems(getCurrentPageProducts()) ? (
            <div className={styles.productGrid}>
              {getCurrentPageProducts().map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
                <p className="mt-1 text-sm text-gray-500">Chúng tôi chưa có sản phẩm nào trong danh mục này.</p>
              </div>
            </div>
          )}
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
