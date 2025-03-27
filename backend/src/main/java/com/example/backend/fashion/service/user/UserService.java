package com.example.backend.fashion.service.user;

import com.example.backend.fashion.entity.model.user.User;
import org.springframework.security.core.Authentication;

public interface UserService {
    User getCurrentUser(Authentication authentication);
} 