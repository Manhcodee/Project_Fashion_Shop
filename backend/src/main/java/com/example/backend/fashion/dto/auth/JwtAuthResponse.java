package com.example.backend.fashion.dto.auth;

import com.example.backend.fashion.entity.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JwtAuthResponse {
    private Long id;
    private String accessToken;
    private String refreshToken;
    private LocalDateTime tokenExpiry;
    private String email;
    private String fullName;
    private Role role;
    private boolean verified;
}