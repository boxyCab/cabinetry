package com.boxy.cabinet_design.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // 注册 JavaTimeModule 用于支持 Java 8 时间类型
        objectMapper.registerModule(new JavaTimeModule());

        // 注册 Hibernate6Module 以处理 Hibernate 的延迟加载问题
        objectMapper.registerModule(new Hibernate6Module());

        // 可选：禁用日期时间序列化为时间戳的默认行为
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return objectMapper;
    }
}
