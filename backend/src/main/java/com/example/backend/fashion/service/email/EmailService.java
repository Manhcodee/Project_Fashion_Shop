package com.example.backend.fashion.service.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Xác thực tài khoản Fashion Shop");
            
            String htmlContent = String.format("""
                <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1976d2; margin-bottom: 20px;">Xác thực tài khoản Fashion Shop</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">
                        Xin chào,<br><br>
                        Mã xác thực của bạn là: <strong style="color: #1976d2; font-size: 24px;">%s</strong><br>
                        Mã này sẽ hết hạn sau 15 phút.
                    </p>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">
                        Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                </div>
            """, code);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác thực", e);
        }
    }

    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            
            String htmlContent = String.format("""
                <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1976d2; margin-bottom: 20px;">%s</h2>
                    <div style="font-size: 16px; line-height: 1.5; color: #333;">
                        %s
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">
                        Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                </div>
            """, subject, content.replace("\n", "<br>"));
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email", e);
        }
    }
}