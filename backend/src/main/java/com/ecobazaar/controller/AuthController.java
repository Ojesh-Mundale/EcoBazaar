package com.ecobazaar.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.model.User;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        return authService.login(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        return authService.register(user);
    }

    @PutMapping("/verify/{id}")
    public ResponseEntity<?> verifySeller(@PathVariable String id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsVerified(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Seller verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Seller not found"));
        }
    }

    @PostMapping("/add-admin")
    public ResponseEntity<?> addAdminUser() {
        return authService.addAdminUser();
    }
}
