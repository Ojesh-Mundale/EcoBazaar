package com.ecobazaar.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.User;
import com.ecobazaar.repository.ProductRepository;
import com.ecobazaar.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<?> getCarbonEmissionReport() {
        try {
            // Get all sellers
            List<User> sellers = userRepository.findByRole("Seller");
            
            // Get carbon aggregation data
            List<ProductRepository.CarbonAggregationResult> carbonData = productRepository.aggregateCarbonBySeller();
            
            // Create a map for quick lookup of carbon data by seller email
            Map<String, ProductRepository.CarbonAggregationResult> carbonDataMap = carbonData.stream()
                .collect(Collectors.toMap(
                    result -> result.get_id(),
                    result -> result
                ));
            
            // Prepare report data
            List<CarbonReportItem> reportData = new ArrayList<>();
            
            for (User seller : sellers) {
                ProductRepository.CarbonAggregationResult carbonInfo = carbonDataMap.get(seller.getEmail());
                
                if (carbonInfo != null) {
                    reportData.add(new CarbonReportItem(
                        seller.getEmail(),
                        carbonInfo.getTotalCarbon(),
                        carbonInfo.getProductCount(),
                        calculateEarningsEstimate(carbonInfo.getProductCount())
                    ));
                } else {
                    // Seller has no active products
                    reportData.add(new CarbonReportItem(
                        seller.getEmail(),
                        0.0,
                        0,
                        0.0
                    ));
                }
            }
            
            // Sort by total carbon emissions (highest first)
            reportData.sort((a, b) -> Double.compare(b.getTotalCarbon(), a.getTotalCarbon()));
            
            return ResponseEntity.ok(Map.of(
                "reportData", reportData,
                "totalSellers", sellers.size(),
                "activeSellers", carbonData.size(),
                "totalCarbonEmissions", reportData.stream().mapToDouble(CarbonReportItem::getTotalCarbon).sum(),
                "totalProducts", reportData.stream().mapToInt(CarbonReportItem::getProductCount).sum()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate carbon emission report: " + e.getMessage()));
        }
    }
    
    // Simple earnings estimation based on product count (can be enhanced later)
    private double calculateEarningsEstimate(int productCount) {
        // Assuming average product price of $25 and 10% commission
        return productCount * 25 * 0.1;
    }
    
    // DTO for carbon report items
    public static class CarbonReportItem {
        private String sellerEmail;
        private double totalCarbon;
        private int productCount;
        private double earningsEstimate;
        
        public CarbonReportItem(String sellerEmail, double totalCarbon, int productCount, double earningsEstimate) {
            this.sellerEmail = sellerEmail;
            this.totalCarbon = totalCarbon;
            this.productCount = productCount;
            this.earningsEstimate = earningsEstimate;
        }
        
        public String getSellerEmail() { return sellerEmail; }
        public double getTotalCarbon() { return totalCarbon; }
        public int getProductCount() { return productCount; }
        public double getEarningsEstimate() { return earningsEstimate; }
        
        public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
        public void setTotalCarbon(double totalCarbon) { this.totalCarbon = totalCarbon; }
        public void setProductCount(int productCount) { this.productCount = productCount; }
        public void setEarningsEstimate(double earningsEstimate) { this.earningsEstimate = earningsEstimate; }
    }
}
