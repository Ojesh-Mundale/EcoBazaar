package com.ecobazaar.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.model.SellerCompleteDetails;
import com.ecobazaar.service.SellerProfileService;
import com.ecobazaar.service.SellerService;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private static final Logger logger = LoggerFactory.getLogger(SellerController.class);

    @Autowired
    private SellerService sellerService;

    @Autowired
    private SellerProfileService sellerProfileService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getSellerStats(Authentication authentication) {
        try {
            String sellerEmail = authentication.getName();
            logger.info("Fetching seller stats for authenticated user: {}", sellerEmail);

            return sellerService.getSellerStats(sellerEmail);
        } catch (Exception e) {
            logger.error("Failed to fetch seller stats", e);
            return ResponseEntity.badRequest().body("Failed to fetch seller stats: " + e.getMessage());
        }
    }

    @PostMapping("/complete-profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> completeProfile(Authentication authentication, @RequestBody SellerCompleteDetails profileDetails) {
        try {
            String sellerEmail = authentication.getName();
            logger.info("Completing profile for seller: {}", sellerEmail);

            return sellerProfileService.completeProfile(sellerEmail, profileDetails);
        } catch (Exception e) {
            logger.error("Failed to complete profile", e);
            return ResponseEntity.badRequest().body("Failed to complete profile: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String sellerEmail = authentication.getName();
            logger.info("Fetching profile for seller: {}", sellerEmail);

            return sellerProfileService.getProfile(sellerEmail);
        } catch (Exception e) {
            logger.error("Failed to get profile", e);
            return ResponseEntity.badRequest().body("Failed to get profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody SellerCompleteDetails updatedProfile) {
        try {
            String sellerEmail = authentication.getName();
            logger.info("Updating profile for seller: {}", sellerEmail);

            return sellerProfileService.updateProfile(sellerEmail, updatedProfile);
        } catch (Exception e) {
            logger.error("Failed to update profile", e);
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    @GetMapping("/profile-status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getProfileStatus(Authentication authentication) {
        try {
            String sellerEmail = authentication.getName();
            boolean isComplete = sellerProfileService.isProfileComplete(sellerEmail);

            return ResponseEntity.ok(Map.of("profileComplete", isComplete));
        } catch (Exception e) {
            logger.error("Failed to get profile status", e);
            return ResponseEntity.badRequest().body("Failed to get profile status: " + e.getMessage());
        }
    }
}
