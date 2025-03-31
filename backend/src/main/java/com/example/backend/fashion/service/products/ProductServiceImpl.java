package com.example.backend.fashion.service.products;

import com.example.backend.fashion.entity.model.products.Product;
import com.example.backend.fashion.repository.products.ProductRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    @Autowired
    private ProductRepository productRepository;

    @Override
    public List<Product> getAllProducts() {
        try {
            logger.info("Fetching all products");
            List<Product> products = productRepository.findAll();
            if (products.isEmpty()) {
                logger.warn("No products found in the database");
            } else {
                logger.info("Retrieved {} products", products.size());
            }
            return products;
        } catch (Exception e) {
            logger.error("Error fetching all products: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch products", e);
        }
    }

    @Override
    public Product getProductById(Long id) {
        try {
            logger.info("Fetching product with ID: {}", id);
            return productRepository.findById(id).orElse(null);
        } catch (Exception e) {
            logger.error("Error fetching product with ID {}: {}", id, e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public List<Product> getFeaturedProducts() {
        try {
            logger.info("Fetching featured products");
            List<Product> products = productRepository.findByIsFeaturedTrue();
            logger.info("Retrieved {} featured products", products.size());
            return products;
        } catch (Exception e) {
            logger.error("Error fetching featured products: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Product> getNewProducts() {
        try {
            logger.info("Fetching new products");
            List<Product> products = productRepository.findByIsNewTrue();
            logger.info("Retrieved {} new products", products.size());
            return products;
        } catch (Exception e) {
            logger.error("Error fetching new products: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Product> getProductsByCategory(String category) {
        try {
            logger.info("Fetching products by category: {}", category);
            List<Product> products = productRepository.findByCategory(category);
            logger.info("Retrieved {} products in category: {}", products.size(), category);
            return products;
        } catch (Exception e) {
            logger.error("Error fetching products by category {}: {}", category, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
} 