package com.example.backend.fashion.controller.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.backend.fashion.service.email.EmailService;
import com.example.backend.fashion.dto.auth.ForgotPasswordRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/test/email")
@CrossOrigin(origins = "*")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username}")
    private String emailUsername;

    @GetMapping("/info")
    public ResponseEntity<?> getEmailConfig() {
        return ResponseEntity.ok().body(Map.of(
                "username", emailUsername,
                "status", "Email được cấu hình"));
    }

    @GetMapping("/send")
    public ResponseEntity<?> testSendEmail(@RequestParam String to) {
        try {
            emailService.sendEmail(
                    to,
                    "Test Email từ ứng dụng",
                    "Đây là email thử nghiệm từ ứng dụng của bạn. Nếu bạn nhận được email này, tính năng gửi email đã hoạt động bình thường.");
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Email đã được gửi thành công đến " + to));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể gửi email: " + e.getMessage(),
                    "error", e.toString()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> testForgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            emailService.sendEmail(
                    request.getEmail(),
                    "Mã xác nhận lấy lại mật khẩu",
                    "Mã xác nhận của bạn là: 123456\nĐây là một mã thử nghiệm.");
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Mã xác nhận (giả lập) đã được gửi đến " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể gửi email: " + e.getMessage(),
                    "error", e.toString()));
        }
    }
}
