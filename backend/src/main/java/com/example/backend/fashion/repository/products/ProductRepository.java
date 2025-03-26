package com.example.backend.fashion.repository.products;

import com.example.backend.fashion.entity.model.products.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm sản phẩm nổi bật với handling null
    @Query("SELECT p FROM Product p WHERE p.isFeatured = true OR p.isFeatured IS NULL")
    List<Product> findByIsFeaturedTrue();
    
    // Tìm sản phẩm mới với handling null
    @Query("SELECT p FROM Product p WHERE p.isNew = true OR p.isNew IS NULL")
    List<Product> findByIsNewTrue();
    
    // Tìm sản phẩm theo danh mục
    List<Product> findByCategory(String category);
}