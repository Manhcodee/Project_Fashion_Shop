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
import CartDropdown from './CartDropdown';
import WishlistDropdown from './WishlistDropdown';
import styles from '../../styles/Header.module.css';

const Header = ({
  user,
  onLogout,
  cartItems = [],
  wishlistItems = [],
  onUpdateCartQuantity,
  onRemoveFromCart,
  onRemoveFromWishlist,
  onAddToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    setShowCartDropdown(!showCartDropdown);
    setShowWishlistDropdown(false);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    setShowWishlistDropdown(!showWishlistDropdown);
    setShowCartDropdown(false);
  };

  const handleViewCart = () => {
    setShowCartDropdown(false);
    router.push('/cart');
  };

  const handleViewWishlist = () => {
    setShowWishlistDropdown(false);
    router.push('/wishlist');
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
            <div className={styles.actionWrapper}>
              <button onClick={handleWishlistClick} className={styles.actionItem}>
                <FaHeart className={styles.actionIcon} />
                <span className={styles.actionText}>Yêu thích</span>
                {wishlistItems.length > 0 && (
                  <span className={styles.actionBadge}>{wishlistItems.length}</span>
                )}
              </button>
              {showWishlistDropdown && (
                <WishlistDropdown
                  items={wishlistItems}
                  onRemoveItem={onRemoveFromWishlist}
                  onAddToCart={onAddToCart}
                  onClose={() => setShowWishlistDropdown(false)}
                  onViewWishlist={handleViewWishlist}
                />
              )}
            </div>

            <div className={styles.actionWrapper}>
              <button onClick={handleCartClick} className={styles.actionItem}>
                <FaShoppingCart className={styles.actionIcon} />
                <span className={styles.actionText}>Giỏ hàng</span>
                {cartItems.length > 0 && (
                  <span className={styles.actionBadge}>{cartItems.length}</span>
                )}
              </button>
              {showCartDropdown && (
                <CartDropdown
                  items={cartItems}
                  onUpdateQuantity={onUpdateCartQuantity}
                  onRemoveItem={onRemoveFromCart}
                  onClose={() => setShowCartDropdown(false)}
                  onViewCart={handleViewCart}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
