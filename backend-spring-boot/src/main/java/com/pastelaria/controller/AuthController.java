package com.pastelaria.controller;

import com.pastelaria.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        // Validação das credenciais do dono (em produção, pode consultar o banco com BCryptPasswordEncoder)
        if (username != null && ("admin".equalsIgnoreCase(username) || "dona".equalsIgnoreCase(username))
                && password != null && ("admin".equals(password) || "123456".equals(password) || "pastelaria123".equals(password))) {

            String token = jwtUtil.generateToken(username.toLowerCase(), "ADMIN", "Administrador Santo Grau");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "type", "Bearer",
                    "user", Map.of(
                            "id", "usr-admin-01",
                            "username", username.toLowerCase(),
                            "name", "Dono da Pastelaria Santo Grau",
                            "role", "ADMIN"
                    )
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Credenciais invalidas. Use usuario 'admin' e senha 'admin'."));
    }
}
