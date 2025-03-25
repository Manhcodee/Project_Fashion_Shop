import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import styles from '../../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h3 className={styles.newsletterTitle}>Đăng ký nhận tin</h3>
              <p className={styles.newsletterDescription}>Nhận thông tin về sản phẩm mới và khuyến mãi hấp dẫn</p>
            </div>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* About Section */}
          <div>
            <h4 className={styles.title}>Về Fashion Shop</h4>
            <p className={styles.description}>
              Chúng tôi cung cấp những sản phẩm thời trang chất lượng cao với giá cả hợp lý nhất cho khách hàng.
            </p>
            <div className={styles.social}>
              <a href="#" className={styles.socialLink}>
                <FaFacebook className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FaTwitter className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FaInstagram className={styles.socialIcon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FaYoutube className={styles.socialIcon} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.title}>Liên kết nhanh</h4>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <Link href="/about" className={styles.link}>
                  Giới thiệu
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/contact" className={styles.link}>
                  Liên hệ
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/terms" className={styles.link}>
                  Điều khoản sử dụng
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/privacy" className={styles.link}>
                  Chính sách bảo mật
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/faq" className={styles.link}>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className={styles.title}>Danh mục</h4>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <Link href="/category/mens-clothing" className={styles.link}>
                  Thời trang nam
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/category/womens-clothing" className={styles.link}>
                  Thời trang nữ
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/category/jewelery" className={styles.link}>
                  Đồng hồ
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/category/electronics" className={styles.link}>
                  Điện tử
                </Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/category/gifts" className={styles.link}>
                  Quà tặng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={styles.title}>Thông tin liên hệ</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </li>
              <li className={styles.contactItem}>
                <FaPhoneAlt className={styles.contactIcon} />
                <span>Hotline: 1900 1234</span>
              </li>
              <li className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>support@fashionshop.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © 2024 Fashion Shop. Tất cả quyền được bảo lưu.
            </p>
            <div className={styles.payments}>
              <img src="/images/payment/visa.png" alt="Visa" className={styles.paymentIcon} />
              <img src="/images/payment/mastercard.png" alt="Mastercard" className={styles.paymentIcon} />
              <img src="/images/payment/paypal.png" alt="PayPal" className={styles.paymentIcon} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 