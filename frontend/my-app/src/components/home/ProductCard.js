import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import styles from '../../styles/ProductCard.module.css';

const ProductCard = ({ product, updateCartCount, updateWishlistCount }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    // Kiểm tra xem sản phẩm có nằm trong wishlist không
    const checkWishlistStatus = async () => {
      if (!apiService.checkAuthStatus()) return;

      try {
        const response = await apiService.getWishlist();
        if (response.data) {
          const isInWishlist = response.data.some(item => item.productId === product.id);
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  if (!product) return null;
  
  // Kiểm tra và định dạng các trường dữ liệu
  const title = product.title || "Sản phẩm không tên";
  const price = parseFloat(product.price) || 0;
  const image = product.image || "/placeholder-image.jpg";
  const rating = parseFloat(product.rating_rate) || 0;
  const ratingCount = parseInt(product.rating_count) || 0;
  const id = product.id;

  // Rút gọn tiêu đề nếu quá dài
  const shortTitle = title.length > 45 ? title.substring(0, 45) + "..." : title;

  // Format giá tiền
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  // Kiểm tra xác thực trước khi thực hiện hành động yêu cầu đăng nhập
  const checkAuth = () => {
    if (!apiService.checkAuthStatus()) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng này', {
        autoClose: 3000,
        pauseOnHover: true,
        hideProgressBar: false
      });
      
      // Chờ 2 giây rồi chuyển hướng đến trang đăng nhập
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      
      return false;
    }
    return true;
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!checkAuth()) return;
    
    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      const response = await apiService.addToCart({
        productId: product.id,
        quantity: 1
      });

      if (response.data) {
        toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
          autoClose: 3000,
          pauseOnHover: true,
          hideProgressBar: false
        });
        
        // Cập nhật số lượng giỏ hàng nếu có hàm callback
        if (updateCartCount) {
          updateCartCount(response.data.items.length);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
          autoClose: 3000,
          pauseOnHover: true,
          hideProgressBar: false
        });
      } else {
        toast.error('Không thể thêm sản phẩm vào giỏ hàng', {
          autoClose: 3000,
          pauseOnHover: true,
          hideProgressBar: false
        });
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!checkAuth()) return;
    
    if (isAddingToWishlist) return;

    try {
      setIsAddingToWishlist(true);
      const response = await apiService.toggleWishlistItem({
        productId: product.id
      });

      if (response.data) {
        const newWishlistState = response.data.action === "added";
        setIsWishlisted(newWishlistState);
        
        toast.success(
          response.data.action === "added"
            ? 'Đã thêm sản phẩm vào danh sách yêu thích!' 
            : 'Đã xóa sản phẩm khỏi danh sách yêu thích!', 
          {
            autoClose: 3000,
            pauseOnHover: true,
            hideProgressBar: false
          }
        );
        
        // Cập nhật số lượng wishlist nếu có hàm callback
        if (updateWishlistCount) {
          try {
            const wishlistResponse = await apiService.getWishlist();
            if (wishlistResponse.data) {
              updateWishlistCount(wishlistResponse.data.length);
            }
          } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích:', error);
          }
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật danh sách yêu thích:", error);
      
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích', {
          autoClose: 3000,
          pauseOnHover: true,
          hideProgressBar: false
        });
      } else {
        toast.error('Không thể cập nhật danh sách yêu thích', {
          autoClose: 3000,
          pauseOnHover: true,
          hideProgressBar: false
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Link href={`/product/${id}`}>
      <div 
        className={styles.productCard}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.imageContainer}>
          <img
            src={image}
            alt={title}
            className={styles.productImage}
            loading="lazy"
          />
          {product.is_featured && (
            <span className={styles.featuredBadge}>Nổi bật</span>
          )}
          {product.is_new && (
            <span className={styles.newBadge}>Mới</span>
          )}
          
          <div className={`${styles.actionButtons} ${isHovered ? styles.show : ''}`}>
            <button 
              className={styles.actionButton} 
              title="Thêm vào giỏ hàng" 
              onClick={handleAddToCart} 
              disabled={isAddingToCart}
            >
              <FaShoppingCart className={styles.actionIcon} />
            </button>
            
            <button 
              className={styles.actionButton} 
              title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"} 
              onClick={handleToggleWishlist} 
              disabled={isAddingToWishlist}
            >
              <FaHeart
                className={`${styles.actionIcon} ${
                  isWishlisted ? styles.wishlisted : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>{shortTitle}</h3>

          <div className={styles.priceRating}>
            <div className={styles.priceContainer}>
              <span className={styles.price}>{formattedPrice}</span>
              {product.original_price && (
                <span className={styles.originalPrice}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(parseFloat(product.original_price))}
                </span>
              )}
            </div>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.star} ${
                      i < Math.round(rating) ? styles.filled : styles.empty
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={styles.ratingCount}>({ratingCount})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 