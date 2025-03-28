package com.example.backend.fashion.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDto {
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String emailOrPhone;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}