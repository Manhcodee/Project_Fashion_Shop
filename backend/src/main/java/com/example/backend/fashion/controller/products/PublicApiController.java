package com.example.backend.fashion.controller.products;

import com.example.backend.fashion.entity.model.products.Product;
import com.example.backend.fashion.service.products.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
    RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class PublicApiController {
    
    private static final Logger logger = LoggerFactory.getLogger(PublicApiController.class);

    @Autowired
    private ProductService productService;
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("Test endpoint called");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "API is working!");
        return ResponseEntity.ok()
            .header("Access-Control-Allow-Origin", "*")
            .body(response);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        logger.info("Getting all products (public API)");
        try {
            List<Product> products = productService.getAllProducts();
            if (products.isEmpty()) {
                logger.info("No products found");
                return ResponseEntity.ok()
                    .header("Access-Control-Allow-Origin", "*")
                    .body(Collections.emptyList());
            }
            logger.info("Retrieved {} products", products.size());
            return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .body(products);
        } catch (Exception e) {
            logger.error("Error retrieving products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Access-Control-Allow-Origin", "*")
                .body(Collections.emptyList());
        }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        logger.info("Getting product with ID: {}", id);
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                logger.warn("Product with ID {} not found", id);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "Product not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Access-Control-Allow-Origin", "*")
                    .body(errorResponse);
            }
            logger.info("Retrieved product: {}", product.getTitle());
            return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .body(product);
        } catch (Exception e) {
            logger.error("Error retrieving product with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Access-Control-Allow-Origin", "*")
                .body(errorResponse);
        }
    }
    
    @GetMapping("/products/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        logger.info("Getting featured products");
        try {
            List<Product> products = productService.getFeaturedProducts();
            if (products.isEmpty()) {
                logger.info("No featured products found");
            } else {
                logger.info("Retrieved {} featured products", products.size());
            }
            return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .body(products);
        } catch (Exception e) {
            logger.error("Error retrieving featured products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Access-Control-Allow-Origin", "*")
                .body(Collections.emptyList());
        }
    }
    
    @GetMapping("/products/new")
    public ResponseEntity<List<Product>> getNewProducts() {
        logger.info("Getting new products");
        try {
            List<Product> products = productService.getNewProducts();
            if (products.isEmpty()) {
                logger.info("No new products found");
            } else {
                logger.info("Retrieved {} new products", products.size());
            }
            return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .body(products);
        } catch (Exception e) {
            logger.error("Error retrieving new products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Access-Control-Allow-Origin", "*")
                .body(Collections.emptyList());
        }
    }
    
    @GetMapping("/products/category/{categoryName}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String categoryName) {
        logger.info("Getting products by category: {}", categoryName);
        try {
            List<Product> products = productService.getProductsByCategory(categoryName);
            if (products.isEmpty()) {
                logger.info("No products found in category: {}", categoryName);
            } else {
                logger.info("Retrieved {} products in category: {}", products.size(), categoryName);
            }
            return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .body(products);
        } catch (Exception e) {
            logger.error("Error retrieving products by category: {}", categoryName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Access-Control-Allow-Origin", "*")
                .body(Collections.emptyList());
        }
    }
} 