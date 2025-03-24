package com.example.backend.fashion.controller.auth;

import com.example.backend.fashion.entity.model.user.User;
import com.example.backend.fashion.repository.user.UserRepository;
import com.example.backend.fashion.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Base64;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000",
        "https://localhost:3000" }, allowCredentials = "true", allowedHeaders = "*", methods = { RequestMethod.GET,
                RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class FacebookAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.client.registration.facebook.client-id}")
    private String facebookClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-secret}")
    private String facebookClientSecret;

    @PostMapping("/facebook-login")
    public ResponseEntity<?> handleFacebookLogin(@RequestBody Map<String, Object> facebookData) {
        try {
            String accessToken = (String) facebookData.get("accessToken");
            String name = (String) facebookData.get("name");
            String email = (String) facebookData.get("email");

            // Nếu không có email từ frontend, thử lấy từ Facebook API
            if (email == null || email.isEmpty()) {
                // Lấy thông tin user từ Facebook
                String facebookGraphApiUrl = String.format(
                        "https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=%s",
                        accessToken);

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + accessToken);

                RestTemplate restTemplate = new RestTemplate();
                ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                        facebookGraphApiUrl,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class);

                if (userInfoResponse.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> userInfo = userInfoResponse.getBody();
                    if (userInfo != null) {
                        email = (String) userInfo.get("email");
                        if (name == null) {
                            name = (String) userInfo.get("name");
                        }
                    }
                }
            }

            // Nếu vẫn không có email, tạo email mặc định từ ID Facebook
            String userId = (String) facebookData.get("userId");
            if ((email == null || email.isEmpty()) && userId != null) {
                email = userId + "@facebook.com";
            }

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Không thể lấy email từ Facebook");
            }

            // Tìm hoặc tạo user
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // Tạo user mới
                user = new User();
                user.setEmail(email);
                user.setFullName(name != null ? name : "Facebook User");
                user.setFacebookId(userId);
                user.setPassword(""); // Facebook users don't need password
                user.setEnabled(true);
                userRepository.save(user);
            }

            // Tạo JWT token
            String token = jwtTokenProvider.generateToken(user.getEmail());

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", token);
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Đăng nhập Facebook thất bại: " + e.getMessage());
        }
    }

    @GetMapping("/facebook/callback")
    public void facebookCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        try {
            String stateJson = new String(Base64.getDecoder().decode(state));
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> stateMap = mapper.readValue(stateJson, Map.class);
            String redirectUrl = stateMap.get("redirect");

            // Tạo đối tượng userResponse
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("accessToken", "tempToken");
            userResponse.put("email", "temp@example.com");
            userResponse.put("fullName", "Temp User");

            // Trao đổi code lấy token
            // ... xử lý logic lấy token từ Facebook ...

            // Gửi token về client qua script
            response.setContentType("text/html;charset=UTF-8");
            PrintWriter out = response.getWriter();
            out.println("<!DOCTYPE html><html><head><script>");
            out.println("window.opener.postMessage({" +
                    "type: 'FACEBOOK_LOGIN_SUCCESS'," +
                    "authData: " + mapper.writeValueAsString(userResponse) +
                    "}, '" + redirectUrl + "');");
            out.println("window.close();");
            out.println("</script></head><body>Đăng nhập thành công! Đang chuyển hướng...</body></html>");
        } catch (Exception e) {
            response.setContentType("text/html;charset=UTF-8");
            PrintWriter out = response.getWriter();
            out.println("<!DOCTYPE html><html><head><script>");
            out.println("window.opener.postMessage({" +
                    "type: 'FACEBOOK_LOGIN_ERROR'," +
                    "error: '" + e.getMessage() + "'" +
                    "}, '" + request.getHeader("Referer") + "');");
            out.println("window.close();");
            out.println("</script></head><body>Đăng nhập thất bại: " + e.getMessage() + "</body></html>");
        }
    }
}
