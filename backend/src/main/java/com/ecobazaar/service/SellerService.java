package com.ecobazaar.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Order;
import com.ecobazaar.model.Product;
import com.ecobazaar.model.SellerStats;
import com.ecobazaar.repository.OrderRepository;
import com.ecobazaar.repository.ProductRepository;
import com.ecobazaar.repository.SellerStatsRepository;

@Service
public class SellerService {

    private static final Logger logger = LoggerFactory.getLogger(SellerService.class);

    @Autowired
    private SellerStatsRepository sellerStatsRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    public ResponseEntity<?> getSellerStats(String sellerEmail) {
        try {
            logger.info("Fetching seller stats for: {}", sellerEmail);

            // Get or create seller stats
            Optional<SellerStats> existingStats = sellerStatsRepository.findBySellerEmail(sellerEmail);
            SellerStats stats;

            if (existingStats.isPresent()) {
                stats = existingStats.get();
                // Update stats with real data
                updateSellerStats(stats, sellerEmail);
            } else {
                // Create new stats record
                stats = new SellerStats(sellerEmail);
                updateSellerStats(stats, sellerEmail);
                sellerStatsRepository.save(stats);
            }

            // Get carbon impact by category for the response
            Map<String, Double> carbonImpactByCategory = calculateCarbonImpactByCategory(
                productRepository.findBySellerEmailAndIsActive(sellerEmail, true));

            // Get recent transactions for the response
            List<Map<String, Object>> recentTransactions = getRecentTransactions(sellerEmail);

            // Calculate return rate for the response
            double returnRate = 0.0;
            List<Order> sellerOrders = getSellerOrders(sellerEmail);
            int totalOrders = sellerOrders.size();
            if (totalOrders > 0) {
                returnRate = ((double) stats.getReturnedOrder() / totalOrders) * 100;
            }

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("totalSales", stats.getTotalSales());
            response.put("totalRevenue", stats.getTotalRevenue());
            response.put("carbonFootprint", stats.getCarbonFootprint());
            response.put("carbonImpactByCategory", carbonImpactByCategory);
            response.put("rating", stats.getRating());
            response.put("ecoBadge", stats.getEcoBadge() != null ? stats.getEcoBadge() : "Eco Beginner");
            response.put("leaderboardPosition", stats.getLeaderboardPosition());
            response.put("pendingPayouts", stats.getPendingPayouts());
            response.put("completedOrder", stats.getCompletedOrder());
            response.put("returnedOrder", stats.getReturnedOrder());
            response.put("returnRate", returnRate);
            response.put("recentTransactions", recentTransactions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch seller stats", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller stats: " + e.getMessage()));
        }
    }

    private void updateSellerStats(SellerStats stats, String sellerEmail) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerEmailAndIsActive(sellerEmail, true);

            // Get seller orders to calculate stats
            List<Order> sellerOrders = getSellerOrders(sellerEmail);

            // Calculate total sales (total items sold)
            int totalSales = sellerOrders.stream()
                .filter(order -> !"CANCELLED".equals(order.getStatus()))
                .mapToInt(order -> order.getItems().stream()
                    .mapToInt(Order.OrderItem::getQuantity)
                    .sum())
                .sum();

            // Calculate total revenue
            double totalRevenue = sellerOrders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

            // Calculate carbon footprint from products
            double carbonFootprint = sellerProducts.stream()
                .mapToDouble(product -> product.getCarbonFootprint())
                .sum();

            // Calculate carbon footprint by category
            Map<String, Double> carbonImpactByCategory = calculateCarbonImpactByCategory(sellerProducts);

            int completedOrders = (int) sellerOrders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus()))
                .count();

            int returnedOrders = (int) sellerOrders.stream()
                .filter(order -> "RETURNED".equals(order.getStatus()))
                .count();

            // Calculate return rate as percentage (returned orders / total orders * 100)
            double returnRate = 0.0;
            int totalOrders = sellerOrders.size();
            if (totalOrders > 0) {
                returnRate = ((double) returnedOrders / totalOrders) * 100;
            }

            // Calculate rating (simplified - average of product ratings)
            double avgRating = sellerProducts.stream()
                .filter(product -> product.getRating() > 0)
                .mapToDouble(Product::getRating)
                .average()
                .orElse(4.8);

            // Update stats
            stats.setTotalSales(totalSales);
            stats.setTotalRevenue(totalRevenue);
            stats.setCarbonFootprint(carbonFootprint);
            stats.setRating(avgRating);
            stats.setCompletedOrder(completedOrders);
            stats.setReturnedOrder(returnedOrders);

            // Eco badge based on carbon footprint and rating
            if (avgRating >= 4.5 && carbonFootprint <= 10.0) {
                stats.setEcoBadge("Eco Champion");
            } else if (avgRating >= 4.0 && carbonFootprint <= 20.0) {
                stats.setEcoBadge("Green Seller");
            } else {
                stats.setEcoBadge("Eco Beginner");
            }

            // Calculate leaderboard position based on competition
            stats.setLeaderboardPosition(calculateLeaderboardPosition(stats.getSellerEmail()));

            // Save the updated stats to database
            sellerStatsRepository.save(stats);
        } catch (Exception e) {
            logger.error("Failed to update seller stats", e);
        }
    }

    private int calculateLeaderboardPosition(String sellerEmail) {
        try {
            // Fetch all seller stats ordered by totalSales descending
            List<SellerStats> allStats = sellerStatsRepository.findAll();

            // Sort sellers by totalSales descending
            allStats.sort((a, b) -> Integer.compare(b.getTotalSales(), a.getTotalSales()));

            // Find the rank of the current seller
            for (int i = 0; i < allStats.size(); i++) {
                if (allStats.get(i).getSellerEmail().equals(sellerEmail)) {
                    return i + 1; // Rank is index + 1
                }
            }
            return allStats.size(); // If not found, return last position
        } catch (Exception e) {
            logger.error("Failed to calculate leaderboard position", e);
            return 0;
        }
    }

    private Map<String, Double> calculateCarbonImpactByCategory(List<Product> sellerProducts) {
        try {
            // Group products by category and sum carbon footprint
            Map<String, Double> carbonByCategory = new java.util.HashMap<>();

            for (Product product : sellerProducts) {
                String category = product.getCategory() != null ? product.getCategory() : "Other";
                double carbonFootprint = product.getCarbonFootprint();

                carbonByCategory.put(category,
                    carbonByCategory.getOrDefault(category, 0.0) + carbonFootprint);
            }

            return carbonByCategory;
        } catch (Exception e) {
            logger.error("Failed to calculate carbon impact by category", e);
            return new java.util.HashMap<>();
        }
    }

    private List<Map<String, Object>> getRecentTransactions(String sellerEmail) {
        try {
            // Get seller's orders (all statuses)
            List<Order> sellerOrders = getSellerOrders(sellerEmail);
            List<Order> recentOrders = sellerOrders.stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate())) // Most recent first
                .limit(10) // Get last 10 transactions
                .toList();

            List<Map<String, Object>> transactions = new java.util.ArrayList<>();

            for (Order order : recentOrders) {
                Map<String, Object> transaction = new java.util.HashMap<>();
                String status = order.getStatus();
                String type;
                String amountPrefix;
                String displayStatus;

                switch (status) {
                    case "DELIVERED":
                        type = "Sale";
                        amountPrefix = "+Rs";
                        displayStatus = "Completed";
                        break;
                    case "PENDING":
                        type = "Sale";
                        amountPrefix = "+Rs";
                        displayStatus = "Pending";
                        break;
                    case "RETURNED":
                        type = "Refund";
                        amountPrefix = "-Rs";
                        displayStatus = "Processed";
                        break;
                    case "CANCELLED":
                        type = "Sale";
                        amountPrefix = "+Rs";
                        displayStatus = "Cancelled";
                        break;
                    default:
                        type = "Sale";
                        amountPrefix = "+Rs";
                        displayStatus = status;
                        break;
                }

                transaction.put("type", type);
                transaction.put("orderId", "Order #" + order.getId());
                transaction.put("orderDate", order.getOrderDate().toLocalDate().toString());
                transaction.put("amount", amountPrefix + String.format("%.2f", order.getTotalAmount()));
                transaction.put("status", displayStatus);
                transaction.put("timeAgo", calculateTimeAgo(order.getOrderDate()));

                transactions.add(transaction);
            }

            return transactions;
        } catch (Exception e) {
            logger.error("Failed to get recent transactions", e);
            return new java.util.ArrayList<>();
        }
    }

    private String calculateTimeAgo(java.time.LocalDateTime orderDate) {
        try {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            java.time.Duration duration = java.time.Duration.between(orderDate, now);

            long minutes = duration.toMinutes();
            if (minutes < 1) {
                return "Just now";
            } else if (minutes < 60) {
                return minutes + " minutes ago";
            } else if (minutes < 1440) { // 24 hours
                long hours = duration.toHours();
                return hours + " hours ago";
            } else {
                long days = duration.toDays();
                return days + " days ago";
            }
        } catch (Exception e) {
            logger.error("Failed to calculate time ago", e);
            return "Unknown";
        }
    }

    private List<Order> getSellerOrders(String sellerEmail) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerEmail(sellerEmail);

            // Extract product IDs
            List<String> sellerProductIds = sellerProducts.stream()
                .map(product -> product.getId().toString())
                .toList();

            // Find all orders and filter those containing seller's products
            List<Order> allOrders = orderRepository.findAll();
            return allOrders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> sellerProductIds.contains(item.getProductId())))
                .toList();
        } catch (Exception e) {
            logger.error("Failed to get seller orders", e);
            return List.of();
        }
    }
}
