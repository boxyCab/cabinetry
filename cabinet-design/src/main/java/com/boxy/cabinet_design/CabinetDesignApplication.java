package com.boxy.cabinet_design;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.boxy.cabinet_design.entity")  // 👈 确保扫描到 entity
public class CabinetDesignApplication {

	public static void main(String[] args) {
		SpringApplication.run(CabinetDesignApplication.class, args);
	}
}