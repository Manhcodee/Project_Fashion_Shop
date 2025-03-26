package com.example.backend.fashion.service.products;

import com.example.backend.fashion.entity.model.products.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(Long id);
    List<Product> getFeaturedProducts();
    List<Product> getNewProducts();
    List<Product> getProductsByCategory(String category);
}