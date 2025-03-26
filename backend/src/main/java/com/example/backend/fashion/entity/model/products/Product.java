package com.example.backend.fashion.entity.model.products;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("rating_rate")
    private Double ratingRate;

    @Column(name = "rating_count")
    @JsonProperty("rating_count")
    private Integer ratingCount;
    
    @Column(name = "is_featured")
    @JsonProperty("is_featured")
    private Boolean isFeatured;
    
    @Column(name = "is_new")
    @JsonProperty("is_new")
    private Boolean isNew;
}