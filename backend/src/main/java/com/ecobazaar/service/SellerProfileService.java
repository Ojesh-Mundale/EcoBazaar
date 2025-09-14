package com.ecobazaar.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Seller;
import com.ecobazaar.model.SellerCompleteDetails;
import com.ecobazaar.repository.SellerCompleteDetailsRepository;
import com.ecobazaar.repository.SellerRepository;

@Service
public class SellerProfileService {

    @Autowired
    private SellerCompleteDetailsRepository sellerCompleteDetailsRepository;

    @Autowired
    private SellerRepository sellerRepository;

    public ResponseEntity<?> completeProfile(String email, SellerCompleteDetails profileDetails) {
        try {
            Optional<Seller> sellerOptional = sellerRepository.findByEmail(email);
            if (sellerOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Seller not found"));
            }

            Seller seller = sellerOptional.get();

            // Check if profile already exists
            Optional<SellerCompleteDetails> existingProfile = sellerCompleteDetailsRepository.findBySeller(seller);
            if (existingProfile.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Profile already completed"));
            }

            profileDetails.setSeller(seller);
            SellerCompleteDetails savedProfile = sellerCompleteDetailsRepository.save(profileDetails);

            return ResponseEntity.ok(savedProfile);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to complete profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getProfile(String email) {
        try {
            Optional<Seller> sellerOptional = sellerRepository.findByEmail(email);
            if (sellerOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("Seller not found");
            }

            Seller seller = sellerOptional.get();
            Optional<SellerCompleteDetails> profileOptional = sellerCompleteDetailsRepository.findBySeller(seller);

            if (profileOptional.isEmpty()) {
                return ResponseEntity.ok().body(null); // Profile not completed yet
            }

            return ResponseEntity.ok(profileOptional.get());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get profile: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateProfile(String email, SellerCompleteDetails updatedProfile) {
        try {
            // Validate required fields
            if (updatedProfile.getName() == null || updatedProfile.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
            }
            if (updatedProfile.getStoreName() == null || updatedProfile.getStoreName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Store name is required"));
            }

            Optional<Seller> sellerOptional = sellerRepository.findByEmail(email);
            if (sellerOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("Seller not found");
            }

            Seller seller = sellerOptional.get();
            Optional<SellerCompleteDetails> existingProfileOptional = sellerCompleteDetailsRepository.findBySeller(seller);

            SellerCompleteDetails profileToSave;

            if (existingProfileOptional.isEmpty()) {
                // Create new profile
                updatedProfile.setSeller(seller);
                profileToSave = updatedProfile;
            } else {
                // Update existing profile
                SellerCompleteDetails existingProfile = existingProfileOptional.get();
                existingProfile.setName(updatedProfile.getName().trim());
                existingProfile.setStoreName(updatedProfile.getStoreName().trim());
                existingProfile.setProductCategories(updatedProfile.getProductCategories() != null ? updatedProfile.getProductCategories() : existingProfile.getProductCategories());
                existingProfile.setDescription(updatedProfile.getDescription());
                existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
                existingProfile.setAddress(updatedProfile.getAddress());
                existingProfile.setWebsite(updatedProfile.getWebsite());
                profileToSave = existingProfile;
            }

            SellerCompleteDetails savedProfile = sellerCompleteDetailsRepository.save(profileToSave);

            return ResponseEntity.ok(savedProfile);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    public boolean isProfileComplete(String email) {
        try {
            Optional<Seller> sellerOptional = sellerRepository.findByEmail(email);
            if (sellerOptional.isEmpty()) {
                return false;
            }

            Seller seller = sellerOptional.get();
            Optional<SellerCompleteDetails> profileOptional = sellerCompleteDetailsRepository.findBySeller(seller);

            return profileOptional.isPresent();

        } catch (Exception e) {
            return false;
        }
    }
}
