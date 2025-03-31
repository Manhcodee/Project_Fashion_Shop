package com.example.backend.fashion.service.cart;

import com.example.backend.fashion.dto.cart.CartDTO;
import com.example.backend.fashion.dto.cart.CartItemDTO;
import com.example.backend.fashion.entity.model.cart.Cart;
import com.example.backend.fashion.entity.model.cart.CartItem;
import com.example.backend.fashion.entity.model.products.Product;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.exception.ResourceNotFoundException;
import com.example.backend.fashion.repository.cart.CartItemRepository;
import com.example.backend.fashion.repository.cart.CartRepository;
import com.example.backend.fashion.repository.products.ProductRepository;
import com.example.backend.fashion.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;

    public CartDTO getCart() {
        try {
            logger.info("Đang lấy thông tin giỏ hàng từ database");
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                logger.warn("Không tìm thấy người dùng hiện tại");
                return null;
            }
            
            Cart cart = cartRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    logger.info("Tạo giỏ hàng mới cho người dùng");
                    Cart newCart = new Cart();
                    newCart.setUser(currentUser);
                    return cartRepository.save(newCart);
                });
            
            logger.info("Lấy thông tin giỏ hàng thành công");
            return convertToDTO(cart);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin giỏ hàng: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy thông tin giỏ hàng", e);
        }
    }

    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }

            String email = authentication.getName();
            return userRepository.findByEmail(email)
                .orElse(null);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin người dùng: {}", e.getMessage(), e);
            return null;
        }
    }

    @Transactional
    public CartDTO addItemToCart(Long userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }
        
        return convertToDTO(cartRepository.findById(cart.getId()).get());
    }

    @Transactional
    public CartDTO updateCartItemQuantity(Long userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));
        
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        
        return convertToDTO(cartRepository.findById(cart.getId()).get());
    }

    @Transactional
    public CartDTO removeItemFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));
        
        cartItemRepository.delete(item);
        
        return convertToDTO(cartRepository.findById(cart.getId()).get());
    }

    private Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        
        List<CartItemDTO> items = new ArrayList<>();
        if (cart.getItems() != null) {
            items = cart.getItems().stream()
                    .map(item -> {
                        CartItemDTO itemDTO = new CartItemDTO();
                        itemDTO.setId(item.getId());
                        itemDTO.setProductId(item.getProduct().getId());
                        itemDTO.setProductName(item.getProduct().getTitle());
                        itemDTO.setProductImage(item.getProduct().getImage());
                        itemDTO.setPrice(item.getProduct().getPrice());
                        itemDTO.setQuantity(item.getQuantity());
                        return itemDTO;
                    })
                    .collect(Collectors.toList());
        }
        
        dto.setItems(items);
        
        // Tính tổng tiền
        double total = items.stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQuantity())
                .sum();
        dto.setTotal(total);
        
        return dto;
    }
}
