import React from 'react';
import Link from 'next/link';
import { FaTshirt, FaFemale, FaClock, FaMobile, FaGift, FaPercent, FaBoxOpen } from 'react-icons/fa';
import styles from '../../styles/Header.module.css';

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
      <div className={styles.container}>
        <div className="flex items-center justify-between">
          <ul className="flex items-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <li key={category.href}>
                  <Link href={category.href} className={styles.navLink}>
                    <Icon className={styles.navIcon} />
                    <span>{category.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="flex items-center gap-4">
            <Link href="/sale" className={styles.navLink}>
              <FaPercent className={styles.navIcon} />
              <span className="text-red-600 font-medium">Sale Off 50%</span>
            </Link>
            <Link href="/new" className={styles.navLink}>
              <FaBoxOpen className={styles.navIcon} />
              <span className="text-indigo-600 font-medium">Hàng mới về</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 