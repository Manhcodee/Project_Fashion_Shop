package com.example.backend.fashion.controller.wishlist;

import com.example.backend.fashion.dto.wishlist.WishlistDTO;
import com.example.backend.fashion.dto.wishlist.WishlistItemDTO;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.service.user.UserService;
import com.example.backend.fashion.service.wishlist.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDTO>> getWishlist(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        List<WishlistItemDTO> wishlist = wishlistService.getWishlistByUserId(user.getId());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/toggle")
    public ResponseEntity<WishlistDTO> toggleWishlistItem(
            @RequestBody WishlistItemDTO wishlistItemDTO,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        WishlistDTO result = wishlistService.toggleWishlistItem(user.getId(), wishlistItemDTO.getProductId());
        return ResponseEntity.ok(result);
    }
}
