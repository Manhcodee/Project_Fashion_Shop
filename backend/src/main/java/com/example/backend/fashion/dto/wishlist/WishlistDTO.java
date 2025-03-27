package com.example.backend.fashion.dto.wishlist;

import lombok.Data;

@Data
public class WishlistDTO {
    private Long userId;
    private Long productId;
    private boolean added;
}
