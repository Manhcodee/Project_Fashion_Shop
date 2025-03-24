package com.example.backend.fashion.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.Map;
import java.util.UUID;

import com.example.backend.fashion.dto.auth.ForgotPasswordRequest;
import com.example.backend.fashion.dto.auth.RegisterRequest;
import com.example.backend.fashion.dto.auth.ResetPasswordRequest;
import com.example.backend.fashion.dto.auth.VerifyCodeRequest;
import com.example.backend.fashion.service.auth.AuthService;
import com.example.backend.fashion.service.login.PasswordResetService;
import com.example.backend.fashion.dto.login.JwtAuthResponse;    
import com.example.backend.fashion.dto.login.LoginDto;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.entity.enums.Role;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().body(Map.of("message", "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto) {
        JwtAuthResponse response = authService.login(loginDto);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok().body(Map.of("message", "Mã xác nhận đã được gửi đến email của bạn"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            boolean isValid = passwordResetService.verifyCode(request.getEmail(), request.getCode());
            return ResponseEntity.ok().body(Map.of("valid", isValid, "message", "Mã xác nhận hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok().body(Map.of("message", "Mật khẩu đã được đặt lại thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/google-login")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String fullName = request.get("fullName");
            String picture = request.get("picture");
            String googleId = request.get("googleId");

            // Kiểm tra email (bắt buộc)
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email không được để trống"));
            }

            // Đảm bảo fullName không null
            if (fullName == null || fullName.isEmpty()) {
                fullName = email.split("@")[0]; // Sử dụng phần đầu của email làm tên
            }

            // Tìm user theo email hoặc googleId
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        if (googleId != null) {
                            return userRepository.findByGoogleId(googleId).orElse(null);
                        }
                        return null;
                    });

            if (user == null) {
                // Tạo user mới
                user = new User();
                user.setEmail(email);
                user.setFullName(fullName);
                user.setGoogleId(googleId);
                user.setProfilePicture(picture);
                // Tạo mật khẩu ngẫu nhiên
                String randomPassword = UUID.randomUUID().toString();
                user.setPassword(passwordEncoder.encode(randomPassword));
                user.setRole(Role.USER);
                user.setEnabled(true);
                user = userRepository.save(user);
            } else {
                // Cập nhật thông tin nếu cần
                boolean needsUpdate = false;
                
                if (user.getFullName() == null || user.getFullName().isEmpty()) {
                    user.setFullName(fullName);
                    needsUpdate = true;
                }
                
                if (googleId != null && user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    needsUpdate = true;
                }
                
                if (picture != null && user.getProfilePicture() == null) {
                    user.setProfilePicture(picture);
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    user = userRepository.save(user);
                }
            }

            // Tạo JWT token
            String token = jwtTokenProvider.generateToken(user.getEmail());

            // Trả về response
            return ResponseEntity.ok(Map.of(
                "accessToken", token,
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().toString(),
                "picture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Đăng nhập Google thất bại: " + e.getMessage()));
        }
    }
    
    // Endpoint kiểm tra kết nối
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok().body(Map.of("status", "online", "message", "Kết nối đến máy chủ thành công"));
    }
} 