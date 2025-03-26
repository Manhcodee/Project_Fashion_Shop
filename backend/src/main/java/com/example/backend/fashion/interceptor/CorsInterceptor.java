package com.example.backend.fashion.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class CorsInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(CorsInterceptor.class);
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        logger.debug("CORS Interceptor handling request: {} {}", request.getMethod(), request.getRequestURI());
        
        // Thêm headers CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "false");
        response.setHeader("Access-Control-Max-Age", "3600");
        
        // Xử lý riêng cho OPTIONS (preflight requests)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            logger.debug("CORS Preflight request processed successfully");
            return false; // Không tiếp tục xử lý yêu cầu OPTIONS
        }
        
        return true; // Tiếp tục chuỗi xử lý
    }
} 