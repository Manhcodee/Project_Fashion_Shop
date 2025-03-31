import React from 'react';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import styles from '../../styles/WishlistDropdown.module.css';

const WishlistDropdown = ({ items = [], onRemoveItem, onAddToCart, onClose, onViewWishlist }) => {
  return (
    <div className={styles.wishlistDropdown}>
      <div className={styles.header}>
        <h3>Danh sách yêu thích ({items.length} sản phẩm)</h3>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>

      <div className={styles.items}>
        {items.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <p>Danh sách yêu thích trống</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.item}>
              <img src={item.image} alt={item.title} className={styles.itemImage} />
              <div className={styles.itemDetails}>
                <h4>{item.title}</h4>
                <p className={styles.price}>{item.price.toLocaleString()}đ</p>
                <div className={styles.actions}>
                  <button
                    onClick={() => onAddToCart(item)}
                    className={styles.addToCartButton}
                  >
                    <FaShoppingCart />
                    <span>Thêm vào giỏ</span>
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className={styles.removeButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.footer}>
          <button onClick={onViewWishlist} className={styles.viewWishlistButton}>
            Xem tất cả
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistDropdown; 