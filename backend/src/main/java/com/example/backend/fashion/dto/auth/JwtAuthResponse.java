package com.example.backend.fashion.dto.auth;

import com.example.backend.fashion.entity.enums.Role;
import lombok.Data;

@Data
public class JwtAuthResponse {
    private String accessToken;
    private String email;
    private String fullName;
    private Role role;
    private boolean verified;
}