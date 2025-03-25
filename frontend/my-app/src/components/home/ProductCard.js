import React from 'react';
import Link from 'next/link';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import styles from '../../styles/ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { id, title, price, image, description, rating_rate } = product;

  return (
    <div className={styles.product_card}>
      <div className={styles.image_wrapper}>
        <img src={image} alt={title} className={styles.image} loading="lazy" />
        <div className={styles.actions}>
          <button className={styles.wishlist_btn} aria-label="Add to wishlist">
            <FaHeart />
          </button>
          <button className={styles.cart_btn} aria-label="Add to cart">
            <FaShoppingCart />
          </button>
        </div>
        <div className={styles.discount}>
          <span>-20%</span>
        </div>
      </div>

      <div className={styles.content}>
        <Link href={`/products/${id}`} className={styles.title_link}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        <div className={styles.rating}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`${styles.star} ${
                  index < Math.round(rating_rate) ? styles.active : ''
                }`}
              />
            ))}
          </div>
          <span className={styles.rating_text}>({rating_rate})</span>
        </div>

        <div className={styles.price_wrapper}>
          <div className={styles.price_group}>
            <span className={styles.original_price}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(price * 23000 * 1.2)}
            </span>
            <span className={styles.current_price}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(price * 23000)}
            </span>
          </div>
          <Link href={`/products/${id}`} className={styles.details_btn}>
            Chi tiết →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 