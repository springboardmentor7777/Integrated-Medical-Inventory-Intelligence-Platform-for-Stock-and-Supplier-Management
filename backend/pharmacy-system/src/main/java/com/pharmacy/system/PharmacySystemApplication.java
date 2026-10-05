package com.pharmacy.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PharmacySystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PharmacySystemApplication.class, args);
    }
}
