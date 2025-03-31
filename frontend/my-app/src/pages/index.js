import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "../components/home/Header";
import Navigation from "../components/home/Navigation";
import ProductCard from "../components/home/ProductCard";
import Footer from "../components/home/Footer";
import Pagination from "../components/common/Pagination";
import apiService from "../services/api";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 8;
  
  // Sắp xếp
  const [sortOption, setSortOption] = useState('newest');
  const [displayProducts, setDisplayProducts] = useState([]);
  
  // Thông tin giỏ hàng và wishlist
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');
        
        if (!token || !userDataStr) {
          console.log("Không có token hoặc user data");
          setUser(null);
          return;
        }

        // Parse user data một cách an toàn
        let userData;
        try {
          userData = JSON.parse(userDataStr);
        } catch (parseError) {
          console.error("Lỗi parse user data:", parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        // Kiểm tra token hợp lệ bằng API service
        await apiService.checkAuthStatus();
        setUser(userData);
        // Lấy thông tin giỏ hàng và wishlist nếu đã đăng nhập
        fetchCartAndWishlistCount();
      } catch (error) {
        console.error("Token không hợp lệ hoặc lỗi xác thực:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        setWishlistCount(0);
      }
    };

    checkAuth();
  }, []);

  const fetchCartAndWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Sử dụng API service để lấy dữ liệu
      const [cartResponse, wishlistResponse] = await Promise.all([
        apiService.getCart(),
        apiService.getWishlist()
      ]);

      // Cập nhật số lượng giỏ hàng
      if (cartResponse.data && cartResponse.data.items) {
        setCartCount(cartResponse.data.items.length);
      }

      // Cập nhật số lượng wishlist
      if (wishlistResponse.data) {
        setWishlistCount(wishlistResponse.data.length);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giỏ hàng/wishlist:", error);
      // Không cần hiển thị lỗi cho người dùng
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    router.push('/');
    toast.success('Đăng xuất thành công!');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy tất cả sản phẩm
        const productsResponse = await apiService.getProducts();
        if (productsResponse.data) {
          setProducts(productsResponse.data);
          setTotalPages(Math.ceil(productsResponse.data.length / productsPerPage));
        }
        
        // Lấy sản phẩm nổi bật
        const featuredResponse = await apiService.getFeaturedProducts();
        if (featuredResponse.data) {
          setBestSellers(featuredResponse.data);
        }
        
        // Lấy sản phẩm mới
        const newProductsResponse = await apiService.getNewProducts();
        if (newProductsResponse.data) {
          setNewProducts(newProductsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật lại số lượng giỏ hàng và wishlist khi thêm/xóa sản phẩm
  const updateCartCount = (count) => {
    setCartCount(count);
  };

  const updateWishlistCount = (count) => {
    setWishlistCount(count);
  };

  // Xử lý sắp xếp sản phẩm
  useEffect(() => {
    if (!products.length) return;
    
    let sortedProducts = [...products];
    
    switch (sortOption) {
      case 'price-asc':
        sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating-desc':
        sortedProducts.sort((a, b) => parseFloat(b.rating_rate || 0) - parseFloat(a.rating_rate || 0));
        break;
      case 'newest':
      default:
        sortedProducts.sort((a, b) => b.id - a.id);
        break;
    }
    
    setDisplayProducts(sortedProducts);
    setCurrentPage(1);
  }, [products, sortOption]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('all-products').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const getCurrentPageProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return displayProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

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
      <ToastContainer position="top-right" autoClose={3000} />
      <Header 
        user={user} 
        onLogout={handleLogout} 
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
      <Navigation />

      <main className="max-w-[1200px] mx-auto px-4 py-8">
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

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section className={`${styles.section} ${styles.bestSellersSection}`}>
            <div className={styles.sectionInner}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Sản phẩm bán chạy</h2>
                  <p className={styles.sectionSubtitle}>
                    Những sản phẩm được yêu thích nhất
                  </p>
                </div>
                <Link href="/category/featured" className={styles.viewAllLink}>
                  Xem tất cả
                  <svg
                    className={styles.arrowIcon}
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
                </Link>
              </div>
              <div className={styles.productGrid}>
                {bestSellers.slice(0, 5).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    updateCartCount={updateCartCount}
                    updateWishlistCount={updateWishlistCount}
                    sectionType="bestSeller"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* New Products Section */}
        {newProducts.length > 0 && (
          <section className={`${styles.section} ${styles.newProductsSection}`}>
            <div className={styles.sectionInner}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Sản phẩm mới</h2>
                  <p className={styles.sectionSubtitle}>
                    Những sản phẩm mới nhất của chúng tôi
                  </p>
                </div>
                <Link href="/category/new-arrivals" className={styles.viewAllLink}>
                  Xem tất cả
                  <svg
                    className={styles.arrowIcon}
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
                </Link>
              </div>
              <div className={styles.productGrid}>
                {newProducts.slice(0, 5).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    updateCartCount={updateCartCount}
                    updateWishlistCount={updateWishlistCount}
                    sectionType="newProduct"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section className={`${styles.section} ${styles.allProductsSection}`}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Tất cả sản phẩm</h2>
                <p className={styles.sectionSubtitle}>
                  Khám phá toàn bộ sản phẩm đang có
                </p>
              </div>
              <div className={styles.filterBar}>
                <select 
                  className={styles.sortSelect}
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
            <div className={styles.productGrid}>
              {getCurrentPageProducts().slice(0, 5).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  updateCartCount={updateCartCount}
                  updateWishlistCount={updateWishlistCount}
                  sectionType="allProduct"
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
