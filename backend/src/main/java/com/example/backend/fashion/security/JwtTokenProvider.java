package com.example.backend.fashion.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationDate;

    private final Key key;

    public JwtTokenProvider(@Value("${app.jwt-secret}") String jwtSecret) {
        // Tạo key từ secret được cấu hình
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // Tạo JWT token từ email
    public String generateToken(String email) {
        try {
            Date currentDate = new Date();
            Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

            return Jwts.builder()
                    .setSubject(email)
                    .setIssuedAt(currentDate)
                    .setExpiration(expireDate)
                    .signWith(key)
                    .compact();
        } catch (Exception e) {
            logger.error("Lỗi khi tạo JWT token: ", e);
            throw new RuntimeException("Không thể tạo JWT token");
        }
    }

    // Tạo refresh token
    public String generateRefreshToken(String email) {
        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

            return Jwts.builder()
                    .setSubject(email)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(key)
                    .compact();
        } catch (Exception e) {
            logger.error("Lỗi khi tạo refresh token: ", e);
            throw new RuntimeException("Không thể tạo refresh token");
        }
    }

    // Lấy email từ JWT token
    public String getEmailFromToken(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy email từ token: ", e);
            throw new RuntimeException("Token không hợp lệ");
        }
    }

    // Lấy thời gian hết hạn từ token
    public Date getExpirationDateFromToken(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thời gian hết hạn từ token: ", e);
            throw new RuntimeException("Token không hợp lệ");
        }
    }

    // Xác thực JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            logger.error("Token không hợp lệ: ", e);
            return false;
        }
    }

    // Helper method để extract claims từ token
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Helper method để extract tất cả claims từ token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
