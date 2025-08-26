package com.ecobazaar.controller;

import com.ecobazaar.model.User;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<?> verifySeller(@PathVariable Long id) {
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
}
