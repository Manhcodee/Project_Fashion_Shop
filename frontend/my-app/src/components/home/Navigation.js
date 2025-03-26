import React from 'react';
import Link from 'next/link';
import { FaTshirt, FaFemale, FaClock, FaMobile, FaGift, FaPercent, FaBoxOpen } from 'react-icons/fa';
import styles from '../../styles/Navigation.module.css';

const Navigation = () => {
  const categories = [
    { name: 'Thời trang nam', href: '/category/mens-clothing', icon: FaTshirt },
    { name: 'Thời trang nữ', href: '/category/womens-clothing', icon: FaFemale },
    { name: 'Đồng hồ', href: '/category/jewelery', icon: FaClock },
    { name: 'Điện tử', href: '/category/electronics', icon: FaMobile },
    { name: 'Quà tặng', href: '/category/gifts', icon: FaGift },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <ul className={styles.navList}>
          {categories.map(({ name, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={styles.navLink}>
                <Icon className={styles.navIcon} />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.navExtras}>
          <Link href="/category/sale" className={`${styles.navLink} ${styles.sale}`}>
            <FaPercent className={styles.navIcon} />
            <span>Sale Off 50%</span>
          </Link>
          <Link href="/category/new-arrivals" className={`${styles.navLink} ${styles.newArrival}`}>
            <FaBoxOpen className={styles.navIcon} />
            <span>Hàng mới về</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
