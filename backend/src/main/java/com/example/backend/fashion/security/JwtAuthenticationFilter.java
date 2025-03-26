package com.example.backend.fashion.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {

        // Log truy cập API
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        logger.info("Filter processing request: {} {}", method, requestURI);
        
        // Bỏ qua yêu cầu OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            addCorsHeaders(response);
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ qua xác thực cho các API public
        if (requestURI.startsWith("/api/products") || 
            requestURI.startsWith("/public/api/") || 
            requestURI.equals("/public/api/products")) {
            
            logger.info("Skipping authentication for public API: {}", requestURI);
            addCorsHeaders(response);
            filterChain.doFilter(request, response);
            return;
        }

        // Lấy JWT token từ request
        String token = getTokenFromRequest(request);
        logger.debug("JWT Token: {}", token);

        // Kiểm tra token hợp lệ
        if(StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            // Lấy username từ token
            String username = jwtTokenProvider.getUsername(token);
            logger.debug("Username from token: {}", username);

            try {
                // Tải thông tin người dùng
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Tạo authentication object
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.debug("Authentication set for user: {}", username);
            } catch (Exception e) {
                logger.error("Authentication error: ", e);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void addCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
