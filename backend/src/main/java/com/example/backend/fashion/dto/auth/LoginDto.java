package com.example.backend.fashion.dto.auth;

import lombok.Data;

@Data
public class LoginDto {
    private String emailOrPhone;
    private String password;
}