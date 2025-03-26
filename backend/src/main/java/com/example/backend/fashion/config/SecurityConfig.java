package com.example.backend.fashion.config;

import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtAuthenticationEntryPoint;
import com.example.backend.fashion.security.JwtAuthenticationFilter;
import com.example.backend.fashion.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter authenticationFilter;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        return request -> {
            OAuth2User oAuth2User = delegate.loadUser(request);
            return oAuth2User;
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cho phép CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Vô hiệu hóa CSRF vì chúng ta sử dụng JWT
                .csrf(AbstractHttpConfigurer::disable)
                // Cấu hình quyền truy cập cho các endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập không cần xác thực cho một số endpoint
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/public/api/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/ws/**", "/topic/**", "/app/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/", "/login", "/sign-in").permitAll()
                        // Yêu cầu xác thực cho tất cả các endpoint khác
                        .anyRequest().authenticated())
                // Cấu hình OAuth2 login
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("http://localhost:3000/sign-in")
                        .defaultSuccessUrl("http://localhost:3000/dashboard", true)
                        .failureUrl("http://localhost:3000/sign-in?error=true")
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService()))
                        .successHandler((request, response, authentication) -> {
                            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                            String email = oAuth2User.getAttribute("email");

                            // Tạo JWT token
                            String token = jwtTokenProvider.generateToken(email);

                            // Chuyển hướng về frontend với token
                            String redirectUrl = String.format(
                                    "http://localhost:3000/sign-in?token=%s",
                                    token);
                            response.sendRedirect(redirectUrl);
                        })
                        .failureHandler((request, response, exception) -> {
                            String redirectUrl = String.format(
                                    "http://localhost:3000/sign-in?error=%s",
                                    exception.getMessage());
                            response.sendRedirect(redirectUrl);
                        }))
                // Cấu hình logout
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:3000/")
                        .permitAll())
                // Cấu hình xử lý lỗi xác thực
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint))
                // Cấu hình quản lý phiên làm việc (stateless vì chúng ta sử dụng JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Đặt filter JWT trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép tất cả các origin
        configuration.setAllowedOrigins(Arrays.asList("*"));
        
        // Cho phép tất cả các HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Cho phép tất cả headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Headers",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Credentials",
                "X-XSRF-TOKEN"));
        
        // Expose headers
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "X-XSRF-TOKEN"));
        
        // Không gửi credentials
        configuration.setAllowCredentials(false);
        
        // Cache CORS response
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}