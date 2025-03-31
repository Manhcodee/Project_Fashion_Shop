package com.example.backend.fashion.controller.products;

import com.example.backend.fashion.entity.model.products.Product;
import com.example.backend.fashion.service.products.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            logger.info("Bắt đầu lấy danh sách sản phẩm");
            List<Product> products = productService.getAllProducts();
            logger.info("Số lượng sản phẩm lấy được: {}", products.size());
            logger.debug("Chi tiết sản phẩm: {}", products);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            logger.info("Đang lấy thông tin sản phẩm với ID: {}", id);
            Product product = productService.getProductById(id);
            if (product == null) {
                logger.warn("Không tìm thấy sản phẩm với ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            logger.info("Lấy thông tin sản phẩm thành công: {}", product.getTitle());
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin sản phẩm: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        try {
            logger.info("Getting featured products");
            List<Product> products = productService.getFeaturedProducts();
            logger.info("Retrieved {} featured products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Error getting featured products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/new")
    public ResponseEntity<List<Product>> getNewProducts() {
        try {
            logger.info("Getting new products");
            List<Product> products = productService.getNewProducts();
            logger.info("Retrieved {} new products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Error getting new products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String categoryName) {
        try {
            logger.info("Getting products by category: {}", categoryName);
            List<Product> products = productService.getProductsByCategory(categoryName);
            logger.info("Retrieved {} products in category: {}", products.size(), categoryName);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Error getting products by category {}: {}", categoryName, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}