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
import com.ecobazaar.repository.SellerRepository;
import com.ecobazaar.repository.UserRepository;
import com.ecobazaar.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

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
        Optional<com.ecobazaar.model.Seller> sellerOptional = sellerRepository.findById(id);
        if (sellerOptional.isPresent()) {
            com.ecobazaar.model.Seller seller = sellerOptional.get();
            seller.setIsVerified(true);
            sellerRepository.save(seller);
            return ResponseEntity.ok(Map.of("message", "Seller verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Seller not found"));
        }
    }


}
