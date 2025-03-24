package com.example.backend.fashion.repository.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.fashion.entity.model.auth.VerificationToken;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByEmailAndTokenAndPurpose(String email, String token, String purpose);
    void deleteByEmailAndPurpose(String email, String purpose);
} 