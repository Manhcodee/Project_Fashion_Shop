import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/ProductCard.module.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
  }).format(price * 23000);

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
          {product.is_featured === 1 && (
            <span className={styles.featuredBadge}>Nổi bật</span>
          )}
          {product.is_new === 1 && (
            <span className={styles.newBadge}>Mới</span>
          )}
          
          <div className={`${styles.actionButtons} ${isHovered ? styles.show : ''}`}>
            <button className={styles.actionButton} title="Thêm vào giỏ hàng" onClick={(e) => {
              e.preventDefault();
              // Xử lý thêm vào giỏ hàng
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
                </path>
              </svg>
            </button>
            
            <button className={styles.actionButton} title="Thêm vào yêu thích" onClick={(e) => {
              e.preventDefault();
              // Xử lý thêm vào yêu thích
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                </path>
              </svg>
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
                  }).format(parseFloat(product.original_price) * 23000)}
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