import React from 'react';
import styles from '../../styles/Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Tạo mảng các số trang
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số lượng trang hiển thị tối đa
    
    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang hiển thị tối đa, hiển thị tất cả các trang
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1);
      
      // Xác định phạm vi trang hiển thị
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Điều chỉnh phạm vi nếu trang hiện tại gần đầu hoặc cuối
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Thêm dấu '...' nếu cần
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Thêm dấu '...' nếu cần
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Luôn hiển thị trang cuối cùng
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className={styles.pagination}>
      {/* Nút Previous */}
      <button 
        className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo; Trước
      </button>
      
      {/* Các số trang */}
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className={styles.ellipsis}>...</span>
          ) : (
            <button
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Nút Next */}
      <button 
        className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau &raquo;
      </button>
    </div>
  );
};

export default Pagination; 