package com.example.backend.fashion.entity.model.products;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal price;

    @Column(name = "image")
    private String image;

    private String category;
    private Integer stock;

    @Column(name = "rating_rate")
    private Double rating_rate;

    @Column(name = "rating_count")
    private Integer rating_count;
}