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

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void register(RegisterRequest request) {
        if ((request.getEmail() == null || request.getEmail().trim().isEmpty()) &&
                (request.getPhone() == null || request.getPhone().trim().isEmpty())) {
            throw new BadRequestException("Cần cung cấp email hoặc số điện thoại");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email đã được sử dụng");
            }
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BadRequestException("Số điện thoại đã được sử dụng");
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        } else {
            String temporaryEmail = "user_" + System.currentTimeMillis() + "@placeholder.com";
            user.setEmail(temporaryEmail);
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone());
        } else {
            String temporaryPhone = "TEMP" + System.currentTimeMillis();
            user.setPhone(temporaryPhone);
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setRole(Role.USER);
        user.setEnabled(false); // Mặc định tài khoản chưa được kích hoạt

        userRepository.save(user);

        // Gửi mã xác thực nếu có email
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            sendVerificationCode(request.getEmail());
        }
    }

    public JwtAuthResponse login(LoginDto loginDto) {
        User user = findUserByEmailOrPhone(loginDto.getEmailOrPhone());

        if (user == null) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản chưa được kích hoạt");
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