package com.example.backend.fashion.controller.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.fashion.service.login.EmailService;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class MailTestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/send-mail")
    public ResponseEntity<?> testSendMail(@RequestParam String to) {
        try {
            emailService.sendEmail(
                to, 
                "Kiểm tra gửi email", 
                "Đây là email kiểm tra tính năng gửi email từ ứng dụng."
            );
            return ResponseEntity.ok().body(Map.of(
                "message", "Email đã được gửi thành công đến " + to
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Không thể gửi email: " + e.getMessage()
            ));
        }
    }
} 