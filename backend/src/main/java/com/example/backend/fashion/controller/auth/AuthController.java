package com.example.backend.fashion.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.Map;

import com.example.backend.fashion.dto.auth.*;
import com.example.backend.fashion.service.auth.AuthService;
import com.example.backend.fashion.service.email.EmailService;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtTokenProvider;
import com.example.backend.fashion.entity.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.backend.fashion.exception.EmailAlreadyExistsException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Đang xử lý đăng ký cho email: {}", request.getEmail());
            
            AuthResponse response = authService.registerUser(request);
            
            return ResponseEntity.ok(new MessageResponse(response.getMessage()));
            
        } catch (EmailAlreadyExistsException e) {
            log.error("Email đã tồn tại: {}", request.getEmail());
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Email này đã được đăng ký!"));
                
        } catch (Exception e) {
            log.error("Lỗi khi đăng ký: ", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto) {
        JwtAuthResponse response = authService.login(loginDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailRequest request) {
        try {
            authService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Mã xác thực đã được gửi đến email của bạn"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        try {
            authService.verifyEmail(request.getEmail(), request.getCode());
            return ResponseEntity.ok(new MessageResponse("Email đã được xác thực thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationCode(@RequestBody EmailRequest request) {
        try {
            authService.resendVerificationCode(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Mã xác thực mới đã được gửi đến email của bạn"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Mã xác nhận đã được gửi đến email của bạn"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            boolean isValid = authService.verifyCode(request.getEmail(), request.getCode());
            return ResponseEntity.ok().body(Map.of("valid", isValid, "message", "Mã xác nhận hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Mật khẩu đã được đặt lại thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String fullName = request.get("fullName");
            String picture = request.get("picture");
            String googleId = request.get("googleId");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Email không được để trống"));
            }

            if (fullName == null || fullName.isEmpty()) {
                fullName = email.split("@")[0];
            }

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        if (googleId != null) {
                            return userRepository.findByGoogleId(googleId).orElse(null);
                        }
                        return null;
                    });

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setFullName(fullName);
                user.setGoogleId(googleId);
                user.setProfilePicture(picture);
                String randomPassword = java.util.UUID.randomUUID().toString();
                user.setPassword(passwordEncoder.encode(randomPassword));
                user.setRole(Role.USER);
                user.setEnabled(true);
                user = userRepository.save(user);
            } else {
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

            String token = jwtTokenProvider.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of(
                    "accessToken", token,
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "role", user.getRole().toString(),
                    "picture", user.getProfilePicture() != null ? user.getProfilePicture() : ""));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Đăng nhập Google thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/save-token")
    public ResponseEntity<?> saveToken(@RequestBody SaveTokenRequest request) {
        try {
            authService.saveToken(request);
            return ResponseEntity.ok(new MessageResponse("Token đã được lưu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            JwtAuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            boolean isValid = jwtTokenProvider.validateToken(token);
            if (isValid) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "role", user.getRole()
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Token không hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(new MessageResponse("Kết nối đến máy chủ thành công"));
    }
}