package com.example.backend.fashion.service.wishlist;

import com.example.backend.fashion.dto.wishlist.WishlistDTO;
import com.example.backend.fashion.dto.wishlist.WishlistItemDTO;
import com.example.backend.fashion.entity.model.products.Product;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.entity.model.wishlist.Wishlist;
import com.example.backend.fashion.exception.ResourceNotFoundException;
import com.example.backend.fashion.repository.products.ProductRepository;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.repository.wishlist.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;

    public List<WishlistItemDTO> getWishlistByUserId(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        
        return wishlistItems.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistDTO toggleWishlistItem(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));
        
        Optional<Wishlist> existingItem = wishlistRepository.findByUserIdAndProductId(userId, productId);
        
        WishlistDTO result = new WishlistDTO();
        result.setUserId(userId);
        result.setProductId(productId);
        
        if (existingItem.isPresent()) {
            // Nếu đã có trong wishlist thì xóa
            wishlistRepository.delete(existingItem.get());
            result.setAdded(false);
        } else {
            // Nếu chưa có thì thêm vào
            Wishlist newItem = new Wishlist();
            newItem.setUser(user);
            newItem.setProduct(product);
            wishlistRepository.save(newItem);
            result.setAdded(true);
        }
        
        return result;
    }

    private WishlistItemDTO convertToDTO(Wishlist wishlist) {
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUser().getId());
        dto.setProductId(wishlist.getProduct().getId());
        dto.setProductName(wishlist.getProduct().getTitle());
        dto.setProductImage(wishlist.getProduct().getImage());
        dto.setPrice(wishlist.getProduct().getPrice());
        dto.setCreatedAt(wishlist.getCreatedAt());
        return dto;
    }
}
