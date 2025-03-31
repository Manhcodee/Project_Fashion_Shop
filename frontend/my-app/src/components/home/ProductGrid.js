import React from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import styles from '../../styles/ProductGrid.module.css';

const ProductGrid = ({
  products = [],
  onAddToCart,
  onAddToWishlist,
  wishlistItems = []
}) => {
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.imageContainer}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>
                {product.price.toLocaleString()}đ
              </p>
              <div className={styles.actions}>
                <button
                  onClick={() => onAddToCart(product)}
                  className={`${styles.actionButton} ${styles.addToCart}`}
                >
                  <FaShoppingCart />
                  <span>Thêm vào giỏ</span>
                </button>
                <button
                  onClick={() => onAddToWishlist(product)}
                  className={`${styles.actionButton} ${styles.addToWishlist} ${
                    isInWishlist(product.id) ? styles.active : ''
                  }`}
                >
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid; 