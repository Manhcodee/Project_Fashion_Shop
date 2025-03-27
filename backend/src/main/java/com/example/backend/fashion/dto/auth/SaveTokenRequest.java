package com.example.backend.fashion.dto.auth;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SaveTokenRequest {
    private Long userId;
    private String accessToken;
    private String refreshToken;
    private LocalDateTime tokenExpiry;
} 