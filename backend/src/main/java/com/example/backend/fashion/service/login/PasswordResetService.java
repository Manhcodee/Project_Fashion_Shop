package com.example.backend.fashion.service.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.fashion.entity.model.auth.VerificationToken;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.exception.BadRequestException;
import com.example.backend.fashion.repository.auth.VerificationTokenRepository;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.service.email.EmailService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final String PASSWORD_RESET_PURPOSE = "PASSWORD_RESET";
    private static final int EXPIRATION_MINUTES = 30;

    /**
     * Gửi mã xác nhận đến email người dùng.
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // Kiểm tra email có tồn tại không
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new BadRequestException("Email không tồn tại trong hệ thống");
        }

        // Xóa mã cũ nếu có
        verificationTokenRepository.deleteByEmailAndPurpose(email, PASSWORD_RESET_PURPOSE);

        // Tạo mã xác nhận mới
        String verificationCode = generateVerificationCode();

        // Lưu mã xác nhận vào DB
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setEmail(email);
        verificationToken.setToken(verificationCode);
        verificationToken.setPurpose(PASSWORD_RESET_PURPOSE);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));

        verificationTokenRepository.save(verificationToken);

        // Gửi mã xác nhận qua email
        String subject = "Mã xác nhận lấy lại mật khẩu";
        String content = "Mã xác nhận của bạn là: " + verificationCode +
                "\nMã này có hiệu lực trong vòng " + EXPIRATION_MINUTES + " phút.";

        emailService.sendEmail(email, subject, content);
    }

    /**
     * Xác thực mã.
     */
    public boolean verifyCode(String email, String code) {
        Optional<VerificationToken> tokenOptional = verificationTokenRepository
                .findByEmailAndTokenAndPurpose(email, code, PASSWORD_RESET_PURPOSE);

        if (tokenOptional.isEmpty()) {
            throw new BadRequestException("Mã xác nhận không hợp lệ");
        }

        VerificationToken token = tokenOptional.get();

        if (token.isExpired()) {
            verificationTokenRepository.delete(token);
            throw new BadRequestException("Mã xác nhận đã hết hạn");
        }

        return true;
    }

    /**
     * Đặt lại mật khẩu.
     */
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        // Xác thực mã
        verifyCode(email, code);

        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa mã xác nhận sau khi sử dụng
        verificationTokenRepository.deleteByEmailAndPurpose(email, PASSWORD_RESET_PURPOSE);
    }

    /**
     * Tạo mã xác nhận 6 chữ số.
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6 chữ số từ 100000 đến 999999
        return String.valueOf(code);
    }
}