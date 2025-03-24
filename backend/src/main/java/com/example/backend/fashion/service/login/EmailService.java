package com.example.backend.fashion.service.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi email thông thường.
     * 
     * @param to      Địa chỉ email nhận
     * @param subject Tiêu đề email
     * @param text    Nội dung email
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            logger.info("Đang gửi email từ '{}' đến: '{}'", fromEmail, to);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            
            logger.info("Email đã được gửi thành công đến: {}", to);
        } catch (MailException e) {
            logger.error("Lỗi khi gửi email đến {}: {}", to, e.getMessage());
            logger.error("Chi tiết lỗi:", e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi gửi email: {}", e.getMessage());
            logger.error("Chi tiết lỗi:", e);
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage(), e);
        }
    }
} 