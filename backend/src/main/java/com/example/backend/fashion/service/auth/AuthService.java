package com.example.backend.fashion.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.fashion.dto.auth.*;
import com.example.backend.fashion.entity.enums.Role;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.exception.BadRequestException;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtTokenProvider;
import com.example.backend.fashion.service.email.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.backend.fashion.exception.EmailAlreadyExistsException;
import com.example.backend.fashion.entity.enums.AuthProvider;
import com.example.backend.fashion.dto.auth.AuthResponse;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        try {
            // Kiểm tra email tồn tại
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new EmailAlreadyExistsException("Email đã tồn tại");
            }

            // Tạo user mới
            User user = new User();
            user.setEmail(request.getEmail());
            user.setFullName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setRole(Role.USER);
            user.setAuthProvider(AuthProvider.LOCAL);
            user.setEnabled(false);
            user.setVerified(false);
            
            // Tạo mã xác thực
            String verificationCode = generateVerificationCode();
            user.setVerificationCode(verificationCode);
            user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
            
            // Lưu user
            userRepository.save(user);
            
            // Gửi email xác thực
            try {
                emailService.sendVerificationEmail(user.getEmail(), verificationCode);
            } catch (Exception e) {
                log.error("Lỗi gửi email xác thực: ", e);
                // Không throw exception ở đây, chỉ log lỗi
            }
            
            return new AuthResponse(true, "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
            
        } catch (EmailAlreadyExistsException e) {
            throw e; // Ném lại exception này để controller xử lý
        } catch (Exception e) {
            log.error("Lỗi không xác định khi đăng ký: ", e);
            throw new RuntimeException("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        }
    }

    public JwtAuthResponse login(LoginDto loginDto) {
        User user = findUserByEmailOrPhone(loginDto.getEmailOrPhone());

        if (user == null) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }

        if (!user.isEnabled() || !user.isVerified()) {
            throw new RuntimeException("Tài khoản chưa được kích hoạt hoặc xác thực. Vui lòng kiểm tra email để xác thực tài khoản.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
        jwtAuthResponse.setAccessToken(token);
        jwtAuthResponse.setEmail(user.getEmail());
        jwtAuthResponse.setFullName(user.getFullName());
        jwtAuthResponse.setRole(user.getRole());
        jwtAuthResponse.setVerified(user.isVerified());

        return jwtAuthResponse;
    }

    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, code);
    }

    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        if (!user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        user.setEnabled(true);
        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        if (user.isEnabled()) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        sendVerificationCode(email);
    }

    public boolean verifyCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        if (!user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        return true;
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        if (!user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    private User findUserByEmailOrPhone(String emailOrPhone) {
        Optional<User> userOptional = userRepository.findByEmail(emailOrPhone);

        if (userOptional.isPresent()) {
            return userOptional.get();
        }

        userOptional = userRepository.findByPhone(emailOrPhone);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }

        return null;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}