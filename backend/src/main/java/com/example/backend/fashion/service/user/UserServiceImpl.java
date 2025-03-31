package com.example.backend.fashion.service.user;

import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        try {
            logger.info("Đang lấy thông tin người dùng hiện tại");
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Không tìm thấy người dùng đã xác thực");
                return null;
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("Không tìm thấy người dùng với email: {}", email);
                    return new RuntimeException("Không tìm thấy người dùng");
                });

            logger.info("Lấy thông tin người dùng thành công: {}", email);
            return user;
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin người dùng: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy thông tin người dùng", e);
        }
    }
} 