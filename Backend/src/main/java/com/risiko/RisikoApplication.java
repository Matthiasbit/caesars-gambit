package com.risiko;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
// Dummy change for CI smoke testing.
public class RisikoApplication {
    public static void main(String[] args) {
        SpringApplication.run(RisikoApplication.class, args);
    }
}
