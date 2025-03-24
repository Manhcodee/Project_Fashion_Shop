package com.example.backend.fashion.dto.login;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {
    private String email;
    private String fullName;
    private String picture;
    private String googleId;
    private String idToken;

    // Constructor with email, fullName, picture, googleId for service method
    public GoogleLoginRequest(String email, String fullName, String picture, String googleId) {
        this.email = email;
        this.fullName = fullName;
        this.picture = picture;
        this.googleId = googleId;
    }
}