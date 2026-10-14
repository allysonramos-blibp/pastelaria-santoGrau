package com.pastelaria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PastelariaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PastelariaApplication.class, args);
        System.out.println("Pastelaria API rodando em: http://localhost:8080/api");
        System.out.println("H2 Database Console: http://localhost:8080/h2-console");
    }
}
