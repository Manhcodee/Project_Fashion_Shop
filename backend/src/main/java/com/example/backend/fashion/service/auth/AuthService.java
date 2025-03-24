package com.example.backend.fashion.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.fashion.dto.auth.RegisterRequest;
import com.example.backend.fashion.entity.enums.Role;
import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.exception.BadRequestException;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtTokenProvider;
import com.example.backend.fashion.dto.login.JwtAuthResponse;
import com.example.backend.fashion.dto.login.LoginDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void register(RegisterRequest request) {
        // Kiểm tra có ít nhất email hoặc phone
        if ((request.getEmail() == null || request.getEmail().trim().isEmpty()) && 
            (request.getPhone() == null || request.getPhone().trim().isEmpty())) {
            throw new BadRequestException("Cần cung cấp email hoặc số điện thoại");
        }
        
        // Kiểm tra email đã tồn tại (nếu có)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email đã được sử dụng");
            }
        }

        // Kiểm tra số điện thoại đã tồn tại (nếu có)
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BadRequestException("Số điện thoại đã được sử dụng");
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        
        // Xử lý email
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        } else {
            // Tạo email tạm thời nếu không có
            String temporaryEmail = "user_" + System.currentTimeMillis() + "@placeholder.com";
            user.setEmail(temporaryEmail);
        }
        
        // Xử lý phone
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone());
        } else {
            // Tạo số điện thoại tạm thời nếu không có
            // Thêm tiền tố và timestamp để đảm bảo tính duy nhất
            String temporaryPhone = "TEMP" + System.currentTimeMillis();
            user.setPhone(temporaryPhone);
        }
        
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setRole(Role.USER);

        userRepository.save(user);
    }

    public JwtAuthResponse login(LoginDto loginDto) {
        // Tìm user dựa vào email hoặc số điện thoại
        User user = findUserByEmailOrPhone(loginDto.getEmailOrPhone());
        
        if (user == null) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }
        
        // Xác thực với email (vì JwtTokenProvider và Spring Security làm việc với email)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        loginDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
        jwtAuthResponse.setAccessToken(token);
        jwtAuthResponse.setEmail(user.getEmail());
        jwtAuthResponse.setFullName(user.getFullName());
        jwtAuthResponse.setRole(user.getRole());

        return jwtAuthResponse;
    }

    // Phương thức trợ giúp để tìm user theo email hoặc số điện thoại
    private User findUserByEmailOrPhone(String emailOrPhone) {
        // Thử tìm theo email
        Optional<User> userOptional = userRepository.findByEmail(emailOrPhone);
        
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        
        // Nếu không tìm thấy theo email, thử tìm theo số điện thoại
        userOptional = userRepository.findByPhone(emailOrPhone);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        
        return null;
    }
} 