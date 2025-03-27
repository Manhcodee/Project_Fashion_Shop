package com.example.backend.fashion.repository.user;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.fashion.entity.model.user.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByGoogleId(String googleId);
    
    @Modifying
    @Query("DELETE FROM User u WHERE u.enabled = false AND u.verificationCodeExpiry < :cutoffTime")
    int deleteUnverifiedUsersOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
} 