package com.boxy.cabinet_design.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseHealthIndicator.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public Health health() {
        try {
            // 执行简单的SQL查询以验证数据库连接
            int result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            if (result == 1) {
                logger.info("数据库连接健康检查：成功");
                return Health.up().withDetail("message", "数据库连接正常").build();
            } else {
                logger.warn("数据库连接健康检查：失败 - 查询返回非预期值");
                return Health.down().withDetail("message", "数据库查询返回非预期值").build();
            }
        } catch (Exception e) {
            logger.error("数据库连接健康检查：失败", e);
            return Health.down().withDetail("message", "无法连接到数据库").withDetail("error", e.getMessage()).build();
        }
    }
} 