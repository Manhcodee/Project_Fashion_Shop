import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import styles from '../../styles/CartDropdown.module.css';

const CartDropdown = ({ items = [], onUpdateQuantity, onRemoveItem, onClose, onViewCart }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.cartDropdown}>
      <div className={styles.header}>
        <h3>Giỏ hàng ({items.length} sản phẩm)</h3>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>

      <div className={styles.items}>
        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Giỏ hàng trống</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.item}>
              <img src={item.image} alt={item.title} className={styles.itemImage} />
              <div className={styles.itemDetails}>
                <h4>{item.title}</h4>
                <p className={styles.price}>{item.price.toLocaleString()}đ</p>
                <div className={styles.quantity}>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className={styles.quantityButton}
                  >
                    <FaMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className={styles.removeButton}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.total}>
            <span>Tổng cộng:</span>
            <span className={styles.totalAmount}>{total.toLocaleString()}đ</span>
          </div>
          <button onClick={onViewCart} className={styles.viewCartButton}>
            Xem giỏ hàng
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDropdown; 