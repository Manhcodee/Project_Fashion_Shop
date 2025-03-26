package com.example.backend.fashion.dto.email;

import lombok.Data;

@Data
public class VerifyEmailRequest {
    private String email;
    private String code;
}