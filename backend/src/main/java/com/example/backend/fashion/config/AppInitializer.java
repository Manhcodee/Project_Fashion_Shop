package com.example.backend.fashion.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Order(Ordered.HIGHEST_PRECEDENCE)
public class AppInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger logger = LoggerFactory.getLogger(AppInitializer.class);

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        Map<String, Object> envVars = new HashMap<>();

        // Tải biến môi trường từ file .env
        Properties props = loadEnvProperties();
        for (String key : props.stringPropertyNames()) {
            envVars.put(key, props.getProperty(key));
        }

        // Thêm các biến môi trường cố định nếu chưa có
        addDefaultIfMissing(envVars, "JWT_SECRET", "daf66e01593f61a15b857cf433aae03a005812b31234e149036bcc8dee755dbb");
        addDefaultIfMissing(envVars, "DB_USERNAME", "root");
        addDefaultIfMissing(envVars, "DB_PASSWORD", "123456");

        // Đặt các biến môi trường vào environment
        MutablePropertySources propertySources = environment.getPropertySources();
        propertySources.addFirst(new MapPropertySource("envVars", envVars));

        logger.info("Đã tải biến môi trường từ .env: {}", String.join(", ", envVars.keySet()));
    }

    private void addDefaultIfMissing(Map<String, Object> envVars, String key, String defaultValue) {
        if (!envVars.containsKey(key)) {
            envVars.put(key, defaultValue);
            logger.info("Đặt giá trị mặc định cho {}", key);
        }
    }

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
            logger.warn("Không tìm thấy file .env ở bất kỳ vị trí nào, sử dụng biến môi trường mặc định");
        }

        return props;
    }
}