import React from 'react';
import Link from 'next/link';
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaHeart,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';
import styles from '../../styles/Header.module.css';

const Header = () => {
  return (
    <header>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div className={styles.topBarLeft}>
            <span><FaPhoneAlt style={{ marginRight: '4px' }} /> Hotline: 1900 1234</span>
            <span><FaEnvelope style={{ marginRight: '4px' }} /> Email: support@fashionshop.com</span>
          </div>
          <div className={styles.topBarRight}>
            <Link href="/sign-in">Đăng nhập</Link>
            <span>|</span>
            <Link href="/sign-up">Đăng ký</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            Fashion Shop
          </Link>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <FaSearch className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className={styles.actionsGroup}>
            <Link href="/wishlist" className={styles.actionItem}>
              <FaHeart className={styles.actionIcon} />
              <span className={styles.actionText}>Yêu thích</span>
              <span className={styles.actionBadge}>0</span>
            </Link>

            <Link href="/cart" className={styles.actionItem}>
              <FaShoppingCart className={styles.actionIcon} />
              <span className={styles.actionText}>Giỏ hàng</span>
              <span className={styles.actionBadge}>0</span>
            </Link>

            <Link href="/profile" className={styles.actionItem}>
              <FaUser className={styles.actionIcon} />
              <span className={styles.actionText}>Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
