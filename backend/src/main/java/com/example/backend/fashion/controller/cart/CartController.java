package com.example.backend.fashion.controller.cart;

import com.example.backend.fashion.dto.cart.CartDTO;
import com.example.backend.fashion.dto.cart.CartItemDTO;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.service.cart.CartService;
import com.example.backend.fashion.service.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        try {
            logger.info("Đang lấy thông tin giỏ hàng");
            CartDTO cart = cartService.getCart();
            if (cart == null) {
                logger.warn("Không tìm thấy giỏ hàng hoặc chưa đăng nhập");
                return ResponseEntity.ok(new CartDTO()); // Trả về giỏ hàng rỗng
            }
            logger.info("Lấy thông tin giỏ hàng thành công");
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin giỏ hàng: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(@RequestBody CartItemDTO cartItemDTO) {
        User user = userService.getCurrentUser();
        CartDTO updatedCart = cartService.addItemToCart(user.getId(), cartItemDTO.getProductId(), cartItemDTO.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/update")
    public ResponseEntity<CartDTO> updateCartItem(@RequestBody CartItemDTO cartItemDTO) {
        User user = userService.getCurrentUser();
        CartDTO updatedCart = cartService.updateCartItemQuantity(user.getId(), cartItemDTO.getProductId(), cartItemDTO.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(@PathVariable Long productId) {
        User user = userService.getCurrentUser();
        CartDTO updatedCart = cartService.removeItemFromCart(user.getId(), productId);
        return ResponseEntity.ok(updatedCart);
    }
}
