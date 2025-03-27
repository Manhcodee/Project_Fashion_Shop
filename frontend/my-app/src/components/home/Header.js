import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaHeart,
  FaPhoneAlt,
  FaEnvelope,
  FaSignOutAlt,
} from 'react-icons/fa';
import styles from '../../styles/Header.module.css';

const Header = ({ user, onLogout, cartCount = 0, wishlistCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.contactInfo}>
            <span><FaPhoneAlt style={{ marginRight: '4px' }} /> Hotline: 1900 1234</span>
            <span><FaEnvelope style={{ marginRight: '4px' }} /> Email: support@fashionshop.com</span>
          </div>
          <div className={styles.userActions}>
            {user ? (
              <>
                <Link href="/profile" className={styles.userAction}>
                  <FaUser className={styles.icon} />
                  <span>{user.fullName}</span>
                </Link>
                <button onClick={onLogout} className={styles.logoutButton}>
                  <FaSignOutAlt className={styles.icon} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className={styles.userAction}>
                  <FaUser className={styles.icon} />
                  <span>Đăng nhập</span>
                </Link>
                <Link href="/sign-up" className={styles.userAction}>
                  <span>Đăng ký</span>
                </Link>
              </>
            )}
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
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <FaSearch className={styles.searchIcon} />
            </button>
          </form>

          {/* Actions */}
          <div className={styles.headerActions}>
            <Link href="/wishlist" className={styles.actionItem}>
              <FaHeart className={styles.actionIcon} />
              <span className={styles.actionText}>Yêu thích</span>
              {wishlistCount > 0 && <span className={styles.actionBadge}>{wishlistCount}</span>}
            </Link>

            <Link href="/cart" className={styles.actionItem}>
              <FaShoppingCart className={styles.actionIcon} />
              <span className={styles.actionText}>Giỏ hàng</span>
              {cartCount > 0 && <span className={styles.actionBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
