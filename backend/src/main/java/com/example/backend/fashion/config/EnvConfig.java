package com.example.backend.fashion.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@Configuration
@PropertySources({
        @PropertySource("classpath:application.properties"),
        @PropertySource(value = "file:${user.dir}/.env", ignoreResourceNotFound = true),
        @PropertySource(value = "file:${user.dir}/../.env", ignoreResourceNotFound = true),
        @PropertySource(value = "file:${user.dir}/backend/.env", ignoreResourceNotFound = true)
})
public class EnvConfig {

    private static final Logger logger = LoggerFactory.getLogger(EnvConfig.class);

    @Autowired
    private Environment environment;

    @EventListener(ApplicationReadyEvent.class)
    public void logEnvVariables() {
        logger.info("Ứng dụng đã khởi động thành công");
        logger.info("Môi trường hiện tại: {}", environment.getProperty("spring.profiles.active"));
        logger.info("Loading biến môi trường từ file .env");

        // Đặt các biến môi trường cần thiết vào System.properties
        setSystemProperties();

        // Log các biến môi trường quan trọng (ẩn các giá trị nhạy cảm)
        logger.info("Google Client ID: {}", maskValue(environment.getProperty("GOOGLE_CLIENT_ID")));
        logger.info("Facebook Client ID: {}", maskValue(environment.getProperty("FACEBOOK_CLIENT_ID")));
        logger.info("Database Username: {}", maskValue(environment.getProperty("DB_USERNAME")));
        logger.info("JWT Secret configured: {}", environment.getProperty("JWT_SECRET") != null ? "Yes" : "No");
        logger.info("Mail Username configured: {}", environment.getProperty("MAIL_USERNAME") != null ? "Yes" : "No");
        logger.info("Spring Google Client ID: {}",
                maskValue(environment.getProperty("spring.security.oauth2.client.registration.google.client-id")));
        logger.info("Spring Facebook Client ID: {}",
                maskValue(environment.getProperty("spring.security.oauth2.client.registration.facebook.client-id")));
    }

    /**
     * Đặt các biến môi trường từ .env vào System.properties
     */
    private void setSystemProperties() {
        Properties envProps = loadEnvProperties();

        // Danh sách các biến môi trường cần thiết
        String[] requiredEnvVars = {
                "JWT_SECRET",
                "GOOGLE_CLIENT_ID",
                "GOOGLE_CLIENT_SECRET",
                "FACEBOOK_CLIENT_ID",
                "FACEBOOK_CLIENT_SECRET",
                "DB_USERNAME",
                "DB_PASSWORD",
                "MAIL_USERNAME",
                "MAIL_PASSWORD"
        };

        // Lặp qua mỗi biến môi trường và đặt nó vào System.properties nếu nó không tồn
        // tại
        for (String key : requiredEnvVars) {
            // Thứ tự ưu tiên: 1. System.getProperty, 2. Environment, 3. .env file
            String value = System.getProperty(key);

            if (value == null) {
                value = environment.getProperty(key);
            }

            if (value == null) {
                value = envProps.getProperty(key);
            }

            if (value != null) {
                System.setProperty(key, value);
                logger.debug("Đã đặt biến môi trường: {} = {}", key, maskValue(value));
            } else {
                logger.warn("Không tìm thấy giá trị cho biến môi trường: {}", key);
            }
        }
    }

    /**
     * Ẩn giá trị nhạy cảm khi hiển thị log
     */
    private String maskValue(String value) {
        if (value == null)
            return "Not set";
        if (value.length() <= 8)
            return "****";
        return value.substring(0, 4) + "****" + value.substring(value.length() - 4);
    }

    /**
     * Tải file .env thủ công nếu @PropertySource không hoạt động
     */
    private Properties loadEnvProperties() {
        Properties props = new Properties();

        // Danh sách các vị trí có thể chứa file .env
        String[] envLocations = {
                ".env",
                "backend/.env",
                "../.env"
        };

        boolean loaded = false;

        // Thử tải từ mỗi vị trí
        for (String location : envLocations) {
            File envFile = new File(location);
            if (envFile.exists()) {
                try (FileInputStream inputStream = new FileInputStream(envFile)) {
                    props.load(inputStream);
                    logger.info("Đã tải thành công file .env từ: {}", envFile.getAbsolutePath());
                    loaded = true;
                    break;
                } catch (IOException e) {
                    logger.error("Không thể tải file .env từ {}: {}", location, e.getMessage());
                }
            }
        }

        if (!loaded) {
            logger.warn("Không tìm thấy file .env ở bất kỳ vị trí nào, sử dụng biến môi trường hệ thống");
        }

        return props;
    }

    /**
     * Phương thức tiện ích để lấy giá trị từ env hoặc properties
     */
    public String getProperty(String key, String defaultValue) {
        String value = environment.getProperty(key);
        return value != null ? value : defaultValue;
    }
}
