package com.example.backend.fashion.controller.cart;

import com.example.backend.fashion.dto.cart.CartDTO;
import com.example.backend.fashion.dto.cart.CartItemDTO;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.service.cart.CartService;
import com.example.backend.fashion.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        CartDTO cart = cartService.getCartByUserId(user.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(
            @RequestBody CartItemDTO cartItemDTO,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        CartDTO updatedCart = cartService.addItemToCart(user.getId(), cartItemDTO.getProductId(), cartItemDTO.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/update")
    public ResponseEntity<CartDTO> updateCartItem(
            @RequestBody CartItemDTO cartItemDTO,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        CartDTO updatedCart = cartService.updateCartItemQuantity(user.getId(), cartItemDTO.getProductId(), cartItemDTO.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        CartDTO updatedCart = cartService.removeItemFromCart(user.getId(), productId);
        return ResponseEntity.ok(updatedCart);
    }
}
