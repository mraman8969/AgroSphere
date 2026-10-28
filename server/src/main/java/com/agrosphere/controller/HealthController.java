package com.agrosphere.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AgroSphere Spring Boot Backend");
        response.put("timestamp", Instant.now().toString());
        response.put("aiServiceConfiguredUrl", aiServiceUrl);
        return ResponseEntity.ok(response);
    }
}
