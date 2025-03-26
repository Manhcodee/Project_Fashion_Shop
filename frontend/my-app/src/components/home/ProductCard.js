import React from 'react';
import Link from 'next/link';
import styles from '../../styles/ProductCard.module.css';

const ProductCard = ({ product }) => {
  if (!product) return null;
  
  // Kiểm tra và định dạng các trường dữ liệu
  const title = product.title || "Sản phẩm không tên";
  const price = product.price || 0;
  const image = product.image || "/placeholder-image.jpg";
  const rating = product.rating_rate || 0;
  const ratingCount = product.rating_count || 0;
  const id = product.id;

  // Rút gọn tiêu đề nếu quá dài
  const shortTitle = title.length > 45 ? title.substring(0, 45) + "..." : title;

  // Format giá tiền
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price * 23000); // Chuyển đổi USD sang VND với tỉ giá ước tính

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        <Link href={`/product/${id}`}>
          <img
            src={image}
            alt={title}
            className={styles.productImage}
          />
        </Link>
        {(product.isFeatured || product.is_featured) && (
          <span className={styles.featuredBadge}>Nổi bật</span>
        )}
        {(product.isNew || product.is_new) && (
          <span className={styles.newBadge}>Mới</span>
        )}
      </div>

      <div className={styles.productInfo}>
        <Link href={`/product/${id}`} className={styles.productLink}>
          <h3 className={styles.productTitle}>{shortTitle}</h3>
        </Link>

        <div className={styles.priceRating}>
          <span className={styles.price}>{formattedPrice}</span>
          <div className={styles.rating}>
            <span className={styles.stars}>
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
            </span>
            <span className={styles.ratingCount}>({ratingCount})</span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.addToCartButton}>
            <svg
              className={styles.cartIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            Thêm vào giỏ
          </button>
          <Link href={`/product/${id}`} className={styles.detailsButton}>
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 