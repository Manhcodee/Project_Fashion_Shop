import React from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSearch, FaHeart, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import styles from '../../styles/Header.module.css';

const Header = () => {
  return (
    <header>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FaPhoneAlt className="w-4 h-4 mr-2" />
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2" />
                <span>Email: support@fashionshop.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hover:text-gray-200">
                Đăng nhập
              </Link>
              <span>|</span>
              <Link href="/register" className="hover:text-gray-200">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <div className="flex items-center justify-between">
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
                <FaSearch className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-8">
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
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.container}>
          <ul className="flex space-x-8">
            <li>
              <Link href="/thoi-trang-nam" className={styles.navLink}>
                Thời trang nam
              </Link>
            </li>
            <li>
              <Link href="/thoi-trang-nu" className={styles.navLink}>
                Thời trang nữ
              </Link>
            </li>
            <li>
              <Link href="/dong-ho" className={styles.navLink}>
                Đồng hồ
              </Link>
            </li>
            <li>
              <Link href="/dien-tu" className={styles.navLink}>
                Điện tử
              </Link>
            </li>
            <li>
              <Link href="/qua-tang" className={styles.navLink}>
                Quà tặng
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 