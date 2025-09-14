package com.ecobazaar.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Customer;
import com.ecobazaar.model.Seller;
import com.ecobazaar.model.SellerCompleteDetails;
import com.ecobazaar.repository.CustomerRepository;
import com.ecobazaar.repository.ProductRepository;
import com.ecobazaar.repository.SellerCompleteDetailsRepository;
import com.ecobazaar.repository.SellerRepository;

@Service
public class AdminService {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SellerCompleteDetailsRepository sellerCompleteDetailsRepository;

    @Autowired
    private OrderService orderService;

    public ResponseEntity<?> getCarbonEmissionReport() {
        try {
            // Get all sellers
            List<Seller> sellers = sellerRepository.findAll();

            // Get carbon aggregation data
            List<ProductRepository.CarbonAggregationResult> carbonData = productRepository.aggregateCarbonBySeller();

            // Create a map for quick lookup of carbon data by seller email
            Map<String, ProductRepository.CarbonAggregationResult> carbonDataMap = carbonData.stream()
                .collect(Collectors.toMap(
                    ProductRepository.CarbonAggregationResult::getSellerEmail,
                    result -> result
                ));

            // Prepare report data
            List<CarbonReportItem> reportData = new ArrayList<>();

            for (Seller seller : sellers) {
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

    public ResponseEntity<?> getAllCustomers() {
        try {
            List<Customer> customers = customerRepository.findAll();
            List<CustomerWithDetails> customersWithDetails = new ArrayList<>();

            for (Customer customer : customers) {
                try {
                    // Get customer stats from OrderService
                    ResponseEntity<?> statsResponse = orderService.getCustomerStats(customer.getEmail());
                    Map<String, Object> stats = (Map<String, Object>) statsResponse.getBody();

                    int totalOrders = stats != null ? ((Number) stats.get("totalOrders")).intValue() : 0;
                    double carbonSaved = stats != null ? ((Number) stats.get("carbonSaved")).doubleValue() : 0.0;

                    customersWithDetails.add(new CustomerWithDetails(
                        customer.getId(),
                        customer.getEmail(),
                        totalOrders,
                        0.0, // totalSpent - can be added later if needed
                        carbonSaved
                    ));
                } catch (Exception e) {
                    // If stats fetch fails, add customer with zero values
                    customersWithDetails.add(new CustomerWithDetails(
                        customer.getId(),
                        customer.getEmail(),
                        0,
                        0.0,
                        0.0
                    ));
                }
            }

            return ResponseEntity.ok(customersWithDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customers: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getAllSellers() {
        try {
            List<Seller> sellers = sellerRepository.findAll();

            // Get carbon aggregation data
            List<ProductRepository.CarbonAggregationResult> carbonData = productRepository.aggregateCarbonBySeller();

            // Create a map for quick lookup of carbon data by seller email
            Map<String, ProductRepository.CarbonAggregationResult> carbonDataMap = carbonData.stream()
                .collect(Collectors.toMap(
                    ProductRepository.CarbonAggregationResult::getSellerEmail,
                    result -> result
                ));

            List<SellerWithDetails> sellersWithDetails = new ArrayList<>();

            for (Seller seller : sellers) {
                // Get seller complete details
                SellerCompleteDetails completeDetails = sellerCompleteDetailsRepository.findBySeller(seller).orElse(null);

                // Get carbon data
                ProductRepository.CarbonAggregationResult carbonInfo = carbonDataMap.get(seller.getEmail());

                sellersWithDetails.add(new SellerWithDetails(
                    seller.getId(),
                    seller.getEmail(),
                    completeDetails != null ? completeDetails.getName() : "N/A",
                    completeDetails != null ? completeDetails.getStoreName() : "N/A",
                    carbonInfo != null ? carbonInfo.getProductCount() : 0,
                    carbonInfo != null ? carbonInfo.getTotalCarbon() : 0.0,
                    seller.getIsVerified()
                ));
            }

            return ResponseEntity.ok(sellersWithDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch sellers: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> deleteCustomer(Long customerId) {
        try {
            // Check if customer exists
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete the customer from database
            customerRepository.deleteById(customerId);

            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete customer: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> deleteSeller(Long sellerId) {
        try {
            // Check if seller exists
            Seller seller = sellerRepository.findById(sellerId).orElse(null);
            if (seller == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete associated seller complete details if exists
            sellerCompleteDetailsRepository.findBySeller(seller).ifPresent(details -> {
                sellerCompleteDetailsRepository.delete(details);
            });

            // Delete the seller from database
            sellerRepository.deleteById(sellerId);

            return ResponseEntity.ok(Map.of("message", "Seller deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete seller: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> approveSeller(Long sellerId) {
        try {
            // Check if seller exists
            Seller seller = sellerRepository.findById(sellerId).orElse(null);
            if (seller == null) {
                return ResponseEntity.notFound().build();
            }

            // Update seller verification status
            seller.setIsVerified(true);
            sellerRepository.save(seller);

            return ResponseEntity.ok(Map.of("message", "Seller approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to approve seller: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getSellerCompleteDetails(Long sellerId) {
        try {
            // Check if seller exists
            Seller seller = sellerRepository.findById(sellerId).orElse(null);
            if (seller == null) {
                return ResponseEntity.notFound().build();
            }

            // Get seller complete details
            SellerCompleteDetails completeDetails = sellerCompleteDetailsRepository.findBySeller(seller).orElse(null);

            if (completeDetails == null) {
                return ResponseEntity.ok(Map.of("message", "Seller has not completed their profile yet"));
            }

            // Get seller statistics
            List<ProductRepository.CarbonAggregationResult> carbonData = productRepository.aggregateCarbonBySeller();
            Map<String, ProductRepository.CarbonAggregationResult> carbonDataMap = carbonData.stream()
                .collect(Collectors.toMap(
                    ProductRepository.CarbonAggregationResult::getSellerEmail,
                    result -> result
                ));

            ProductRepository.CarbonAggregationResult carbonInfo = carbonDataMap.get(seller.getEmail());

            // Get order count for this seller
            int totalOrders = orderService.getSellerOrderCount(seller.getEmail());

            // Create combined response
            Map<String, Object> sellerDetails = new HashMap<>();
            sellerDetails.put("id", completeDetails.getId());
            sellerDetails.put("email", seller.getEmail());
            sellerDetails.put("name", completeDetails.getName());
            sellerDetails.put("phone", completeDetails.getPhoneNumber());
            sellerDetails.put("storeName", completeDetails.getStoreName());
            sellerDetails.put("storeDescription", completeDetails.getDescription());
            sellerDetails.put("website", completeDetails.getWebsite());
            sellerDetails.put("totalProducts", carbonInfo != null ? carbonInfo.getProductCount() : 0);
            sellerDetails.put("totalOrders", totalOrders);
            sellerDetails.put("carbonFootprint", carbonInfo != null ? carbonInfo.getTotalCarbon() : 0.0);
            sellerDetails.put("isVerified", seller.getIsVerified());
            sellerDetails.put("registrationDate", completeDetails.getCreatedAt());

            return ResponseEntity.ok(sellerDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller details: " + e.getMessage()));
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

    // DTO for customer with details
    public static class CustomerWithDetails {
        private Long id;
        private String email;
        private long orders;
        private double totalSpent;
        private double carbonSaved;

        public CustomerWithDetails(Long id, String email, long orders, double totalSpent, double carbonSaved) {
            this.id = id;
            this.email = email;
            this.orders = orders;
            this.totalSpent = totalSpent;
            this.carbonSaved = carbonSaved;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public long getOrders() { return orders; }
        public double getTotalSpent() { return totalSpent; }
        public double getCarbonSaved() { return carbonSaved; }

        public void setId(Long id) { this.id = id; }
        public void setEmail(String email) { this.email = email; }
        public void setOrders(long orders) { this.orders = orders; }
        public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }
        public void setCarbonSaved(double carbonSaved) { this.carbonSaved = carbonSaved; }
    }

    // DTO for seller with details
    public static class SellerWithDetails {
        private Long id;
        private String email;
        private String name;
        private String storeName;
        private int totalProducts;
        private double carbonFootprint;
        private Boolean isVerified;

        public SellerWithDetails(Long id, String email, String name, String storeName, int totalProducts, double carbonFootprint, Boolean isVerified) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.storeName = storeName;
            this.totalProducts = totalProducts;
            this.carbonFootprint = carbonFootprint;
            this.isVerified = isVerified;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getStoreName() { return storeName; }
        public int getTotalProducts() { return totalProducts; }
        public double getCarbonFootprint() { return carbonFootprint; }
        public Boolean getIsVerified() { return isVerified; }

        public void setId(Long id) { this.id = id; }
        public void setEmail(String email) { this.email = email; }
        public void setName(String name) { this.name = name; }
        public void setStoreName(String storeName) { this.storeName = storeName; }
        public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }
        public void setCarbonFootprint(double carbonFootprint) { this.carbonFootprint = carbonFootprint; }
        public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    }
}
