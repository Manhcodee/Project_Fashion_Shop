package com.example.backend.fashion.service.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.fashion.repository.user.UserRepository;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Service
@Slf4j
public class UserCleanupService {

    @Autowired
    private UserRepository userRepository;

    @Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
    @Transactional
    public void cleanupUnverifiedUsers() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
            
            int deletedCount = userRepository.deleteUnverifiedUsersOlderThan(cutoffTime);
            
            if (deletedCount > 0) {
                log.info("Đã xóa {} tài khoản không được kích hoạt sau 15 phút", deletedCount);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa tài khoản không được kích hoạt: ", e);
        }
    }
} 