package com.boxy.cabinet_design.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;

@Component
public class DbConnectionTest implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DbConnectionTest.class);

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Override
    public void run(String... args) {
        logger.info("开始测试数据库连接...");
        logger.info("连接URL: {}", url);
        logger.info("用户名: {}", username);

        try {
            // 加载驱动
            Class.forName("com.mysql.cj.jdbc.Driver");
            logger.info("MySQL驱动加载成功");

            // 尝试连接
            try (Connection conn = DriverManager.getConnection(url, username, password)) {
                logger.info("数据库连接成功!");
                logger.info("数据库产品名称: {}", conn.getMetaData().getDatabaseProductName());
                logger.info("数据库产品版本: {}", conn.getMetaData().getDatabaseProductVersion());
                logger.info("JDBC驱动版本: {}", conn.getMetaData().getDriverVersion());
            }
        } catch (Exception e) {
            logger.error("数据库连接测试失败", e);
        }
    }
} 