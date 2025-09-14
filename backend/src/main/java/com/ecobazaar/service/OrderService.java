package com.ecobazaar.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.CustomerDetails;
import com.ecobazaar.model.Order;
import com.ecobazaar.model.Product;
import com.ecobazaar.model.SellerStats;
import com.ecobazaar.repository.CustomerDetailsRepository;
import com.ecobazaar.repository.FeedbackRepository;
import com.ecobazaar.repository.OrderRepository;
import com.ecobazaar.repository.ProductRepository;
import com.ecobazaar.repository.SellerStatsRepository;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerDetailsRepository customerDetailsRepository;

    @Autowired
    private SellerStatsRepository sellerStatsRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    public ResponseEntity<?> createOrder(Order order, String customerEmail) {
        try {
            logger.info("Creating order for customer: {}", customerEmail);

            // Set customer email
            order.setCustomerEmail(customerEmail);

            // Generate tracking number
            order.setTrackingNumber("EB" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            // Validate and update inventory, and populate seller information
            for (Order.OrderItem item : order.getItems()) {
                Long productIdLong;
                try {
                    productIdLong = Long.parseLong(item.getProductId());
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid product ID format: " + item.getProductId()
                    ));
                }
                Optional<Product> product = productRepository.findById(productIdLong);
                if (product.isPresent()) {
                    Product p = product.get();
                    if (p.getInventory() < item.getQuantity()) {
                        return ResponseEntity.badRequest().body(Map.of(
                            "error", "Insufficient inventory for product: " + p.getName()
                        ));
                    }
                    // Populate seller information in the order item
                    item.setShopName(p.getShopName());
                    item.setSellerEmail(p.getSellerEmail());
                    item.setCategory(p.getCategory());

                    // Reduce inventory
                    p.setInventory(p.getInventory() - item.getQuantity());
                    productRepository.save(p);
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Product not found: " + item.getProductId()
                    ));
                }
            }

            // Save the order
            Order savedOrder = orderRepository.save(order);

            // Update SellerStats for each seller involved
            try {
                Map<String, Double> sellerAmounts = new HashMap<>();
                for (Order.OrderItem item : savedOrder.getItems()) {
                    String sellerEmail = item.getSellerEmail();
                    double itemTotal = item.getPrice() * item.getQuantity();
                    sellerAmounts.put(sellerEmail, sellerAmounts.getOrDefault(sellerEmail, 0.0) + itemTotal);
                }

                for (Map.Entry<String, Double> entry : sellerAmounts.entrySet()) {
                    String sellerEmail = entry.getKey();
                    double amount = entry.getValue();

                    Optional<SellerStats> sellerStatsOpt = sellerStatsRepository.findBySellerEmail(sellerEmail);
                    SellerStats sellerStats;
                    if (sellerStatsOpt.isPresent()) {
                        sellerStats = sellerStatsOpt.get();
                    } else {
                        sellerStats = new SellerStats();
                        sellerStats.setSellerEmail(sellerEmail);
                        sellerStats.setTotalRevenue(0.0);
                        sellerStats.setPendingPayouts(0.0);
                        sellerStats.setTotalSales(0);
                        sellerStats.setCompletedOrder(0);
                    }

                    // COD orders will be added to pending payouts when seller accepts them (CONFIRMED status)
                    // No longer adding COD amounts to pending payouts when order is created

                    sellerStatsRepository.save(sellerStats);
                }
            } catch (Exception e) {
                logger.error("Failed to update seller stats for new order", e);
            }

            //logger.info("Order created successfully with id: {}", savedOrder.getId());

            return ResponseEntity.ok(Map.of(
                "message", "Order created successfully",
                "order", savedOrder
            ));
        } catch (Exception e) {
            logger.error("Failed to create order", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCustomerOrders(String customerEmail) {
        try {
            List<Order> orders = orderRepository.findByCustomerEmailOrderByOrderDateDesc(customerEmail);

            return ResponseEntity.ok(Map.of(
                "orders", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getOrderById(String orderId, String customerEmail) {
        try {
            Long orderIdLong;
            try {
                orderIdLong = Long.parseLong(orderId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID format"));
            }
            Optional<Order> order = orderRepository.findById(orderIdLong);

            if (order.isPresent() && order.get().getCustomerEmail().equals(customerEmail)) {
                return ResponseEntity.ok(Map.of("order", order.get()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch order: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> updateOrderStatus(String orderId, String status, String customerEmail) {
        try {
            Long orderIdLong;
            try {
                orderIdLong = Long.parseLong(orderId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID format"));
            }
            Optional<Order> orderOpt = orderRepository.findById(orderIdLong);

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();

                // Only allow customers to cancel their own pending orders
                if (order.getCustomerEmail().equals(customerEmail) &&
                    order.getStatus().equals("PENDING") &&
                    status.equals("CANCELLED")) {

                    order.setStatus(status);
                    Order updatedOrder = orderRepository.save(order);

                    // Restore inventory
                    for (Order.OrderItem item : order.getItems()) {
                        try {
                            Long productIdLong = Long.parseLong(item.getProductId());
                            Optional<Product> product = productRepository.findById(productIdLong);
                            if (product.isPresent()) {
                                Product p = product.get();
                                p.setInventory(p.getInventory() + item.getQuantity());
                                productRepository.save(p);
                            }
                        } catch (NumberFormatException e) {
                            logger.warn("Invalid product ID format in order item: {}", item.getProductId());
                        }
                    }

                    return ResponseEntity.ok(Map.of(
                        "message", "Order cancelled successfully",
                        "order", updatedOrder
                    ));
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cannot update order status"
                    ));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update order: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> updateSellerOrderStatus(String orderId, String status, String sellerEmail) {
        try {
            logger.info("Updating order {} status to {} for seller {}", orderId, status, sellerEmail);

            Long orderIdLong;
            try {
                orderIdLong = Long.parseLong(orderId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID format"));
            }
            Optional<Order> orderOpt = orderRepository.findById(orderIdLong);

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                logger.info("Found order with current status: {}", order.getStatus());

                // Check if the seller owns any products in this order
                boolean sellerOwnsProduct = order.getItems().stream()
                    .anyMatch(item -> {
                        try {
                            Long productIdLong = Long.parseLong(item.getProductId());
                            Optional<Product> product = productRepository.findById(productIdLong);
                            if (product.isPresent()) {
                                String productSellerEmail = product.get().getSellerEmail();
                                logger.info("Product {} belongs to seller {}", item.getProductId(), productSellerEmail);
                                return productSellerEmail != null && productSellerEmail.equals(sellerEmail);
                            }
                        } catch (NumberFormatException e) {
                            logger.warn("Invalid product ID format in order item: {}", item.getProductId());
                        }
                        return false;
                    });

                logger.info("Seller owns product in order: {}", sellerOwnsProduct);

                if (!sellerOwnsProduct) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "You don't have permission to update this order"
                    ));
                }

                // Validate status transitions
                String currentStatus = order.getStatus();
                logger.info("Validating transition from {} to {}", currentStatus, status);

                if (!isValidStatusTransition(currentStatus, status)) {
                    logger.warn("Invalid status transition from {} to {}", currentStatus, status);
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid status transition from " + currentStatus + " to " + status
                    ));
                }

                order.setStatus(status.toUpperCase());
                Order updatedOrder = orderRepository.save(order);
                logger.info("Order status updated successfully to {}", status.toUpperCase());

                // Update SellerStats pendingPayouts and totalRevenue based on paymentMethod and status
                try {
                    if (order.getPaymentMethod() != null && order.getPaymentMethod().equalsIgnoreCase("COD")) {
                        Optional<SellerStats> sellerStatsOpt = sellerStatsRepository.findBySellerEmail(sellerEmail);
                        if (sellerStatsOpt.isPresent()) {
                            SellerStats sellerStats = sellerStatsOpt.get();

                            // Calculate seller's portion of the order
                            double sellerAmount = order.getItems().stream()
                                .filter(item -> sellerEmail.equals(item.getSellerEmail()))
                                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                .sum();

                            if (status.equalsIgnoreCase("CONFIRMED")) {
                                // Add to pendingPayouts when seller accepts COD order
                                sellerStats.setPendingPayouts(sellerStats.getPendingPayouts() + sellerAmount);
                            } else if (status.equalsIgnoreCase("DELIVERED")) {
                                // Reduce pendingPayouts when order is delivered
                                double newPending = sellerStats.getPendingPayouts() - sellerAmount;
                                sellerStats.setPendingPayouts(newPending < 0 ? 0 : newPending);
                            }
                            sellerStatsRepository.save(sellerStats);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to update seller stats for order status change", e);
                }

                return ResponseEntity.ok(Map.of(
                    "message", "Order status updated successfully",
                    "order", updatedOrder
                ));
            } else {
                logger.warn("Order not found: {}", orderId);
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }
        } catch (Exception e) {
            logger.error("Failed to update seller order status", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update order: " + e.getMessage()));
        }
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions for sellers
        switch (currentStatus.toUpperCase()) {
            case "PENDING":
                return newStatus.equalsIgnoreCase("CONFIRMED") || newStatus.equalsIgnoreCase("CANCELLED");
            case "CONFIRMED":
                return newStatus.equalsIgnoreCase("SHIPPED") || newStatus.equalsIgnoreCase("DELIVERED");
            case "SHIPPED":
                return newStatus.equalsIgnoreCase("DELIVERED");
            case "DELIVERED":
            case "CANCELLED":
                return false; // Cannot change status once delivered or cancelled
            default:
                return false;
        }
    }

    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(Map.of("orders", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getSellerOrders(String sellerEmail) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerEmail(sellerEmail);

            // Extract product IDs
            List<Long> sellerProductIds = sellerProducts.stream()
                .map(Product::getId)
                .toList();

            // Find all orders and filter those containing seller's products
            List<Order> allOrders = orderRepository.findAll();
            List<Order> sellerOrders = allOrders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> {
                        Long itemProductId;
                        try {
                            itemProductId = Long.parseLong(item.getProductId());
                        } catch (NumberFormatException e) {
                            return false;
                        }
                        return sellerProductIds.contains(itemProductId);
                    }))
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate())) // Sort by date desc
                .toList();

            return ResponseEntity.ok(Map.of(
                "orders", sellerOrders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller orders: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getSellerTransactions(String sellerEmail) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerEmail(sellerEmail);

            // Extract product IDs
            List<Long> sellerProductIds = sellerProducts.stream()
                .map(Product::getId)
                .toList();

            // Find all orders and filter those containing seller's products
            List<Order> allOrders = orderRepository.findAll();
            List<Order> sellerOrders = allOrders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> {
                        Long itemProductId;
                        try {
                            itemProductId = Long.parseLong(item.getProductId());
                        } catch (NumberFormatException e) {
                            return false;
                        }
                        return sellerProductIds.contains(itemProductId);
                    }))
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate())) // Sort by date desc
                .toList();

            // Convert orders to transactions
            List<Map<String, Object>> transactions = sellerOrders.stream()
                .map(order -> {
                    String type;
                    String status;
                    double amount;

                    switch (order.getStatus().toUpperCase()) {
                        case "DELIVERED":
                            type = "Sale";
                            status = "Completed";
                            amount = order.getTotalAmount();
                            break;
                        case "CANCELLED":
                            type = "Refund";
                            status = "Processed";
                            amount = -order.getTotalAmount(); // Negative for refunds
                            break;
                        case "PENDING":
                        case "CONFIRMED":
                        case "SHIPPED":
                        default:
                            type = "Sale";
                            status = "Pending";
                            amount = order.getTotalAmount();
                            break;
                    }

                    return Map.<String, Object>of(
                        "id", order.getId(),
                        "date", order.getOrderDate().toLocalDate().toString(),
                        "amount", Math.abs(amount), // Always positive for display
                        "type", type,
                        "status", status,
                        "orderId", "#00" + order.getId()
                    );
                })
                .toList();

            return ResponseEntity.ok(Map.of(
                "transactions", transactions
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller transactions: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCustomerStats(String customerEmail) {
        try {
            List<Order> orders = orderRepository.findByCustomerEmailOrderByOrderDateDesc(customerEmail);

            int totalOrders = orders.size();
            double totalSpent = orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

            double totalCarbonSaved = orders.stream()
                .mapToDouble(Order::getCarbonSaved)
                .sum();

            // Calculate loyalty points as an example (e.g., 1 point per Rs 10 spent)
            int loyaltyPoints = (int) (totalSpent / 10);

            // Calculate eco score as an example (scale 0-100)
            int ecoScore = (int) Math.min(100, (totalCarbonSaved / totalSpent) * 100);

            // For simplicity, trees saved is proportional to carbon saved
            double treesSaved = totalCarbonSaved / 12.0;

            // // Eco badge based on eco score
            // String ecoBadge;
            // if (ecoScore > 80) {
            //     ecoBadge = "Green Warrior";
            // } else if (ecoScore > 50) {
            //     ecoBadge = "Eco Enthusiast";
            // } else {
            //     ecoBadge = "Eco Beginner";
            // }

            Map<String, Object> stats = Map.of(
                "totalOrders", totalOrders,
                "totalSpent", totalSpent,
                "loyaltyPoints", loyaltyPoints,
                "ecoScore", ecoScore,
                "carbonSaved", totalCarbonSaved,
                "treesSaved", treesSaved
                //"ecoBadge", ecoBadge
            );

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customer stats: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCarbonImpactByCategory(String customerEmail) {
        try {
            List<Order> orders = orderRepository.findByCustomerEmailOrderByOrderDateDesc(customerEmail);

            // Map of category to total carbon impact
            Map<String, Double> carbonByCategory = new java.util.HashMap<>();

            for (Order order : orders) {
                if (order.getItems() == null) continue;
                for (Order.OrderItem item : order.getItems()) {
                    // Fetch product category from product repository
                    Long productIdLong;
                    try {
                        productIdLong = Long.parseLong(item.getProductId());
                    } catch (NumberFormatException e) {
                        continue;
                    }
                    Optional<com.ecobazaar.model.Product> productOpt = productRepository.findById(productIdLong);
                    if (productOpt.isPresent()) {
                        String category = productOpt.get().getCategory();
                        double carbonImpact = item.getCarbonFootprint() * item.getQuantity();
                        carbonByCategory.put(category, carbonByCategory.getOrDefault(category, 0.0) + carbonImpact);
                    }
                }
            }

            return ResponseEntity.ok(carbonByCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch carbon impact by category: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCustomerDetails(String customerEmail) {
        try {
            Optional<CustomerDetails> customerDetails = customerDetailsRepository.findByCustomerEmail(customerEmail);

            if (customerDetails.isPresent()) {
                CustomerDetails details = customerDetails.get();
                Map<String, Object> response = Map.of(
                    "customerEmail", details.getCustomerEmail(),
                    "orders", details.getOrders(),
                    "totalSpent", details.getTotalSpent(),
                    "carbonSaved", details.getCarbonSaved()
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customer details: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCustomerOrdersByCategory(String customerEmail, String category) {
        try {
            List<Order> orders = orderRepository.findByCustomerEmailOrderByOrderDateDesc(customerEmail);

            // Filter orders that contain items of the specified category
            List<Order> filteredOrders = orders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> category.equalsIgnoreCase(item.getCategory())))
                .toList();

            return ResponseEntity.ok(Map.of(
                "orders", filteredOrders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch orders by category: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> submitFeedback(Map<String, Object> feedbackData, String customerEmail) {
        try {
            // Extract feedback data
            Object orderIdObj = feedbackData.get("orderId");
            String orderIdStr = orderIdObj != null ? orderIdObj.toString() : null;
            String feedbackText = (String) feedbackData.get("feedback");
            String productId = (String) feedbackData.get("productId");

            if (orderIdStr == null || feedbackText == null || feedbackText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order ID and feedback are required"));
            }

            // Validate order exists and belongs to customer
            Long orderIdLong;
            try {
                orderIdLong = Long.parseLong(orderIdStr);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID format"));
            }

            Optional<Order> orderOpt = orderRepository.findById(orderIdLong);
            if (!orderOpt.isPresent() || !orderOpt.get().getCustomerEmail().equals(customerEmail)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found or access denied"));
            }

            Order order = orderOpt.get();

            // If productId is provided, validate it exists in the order
            if (productId != null && !productId.trim().isEmpty()) {
                boolean productExistsInOrder = order.getItems().stream()
                    .anyMatch(item -> productId.equals(item.getProductId()));
                if (!productExistsInOrder) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Product not found in this order"));
                }
            }

            // Get product details for feedback
            String sellerEmail = null;
            String productName = null;
            String shopName = null;
            if (productId != null && !productId.trim().isEmpty()) {
                try {
                    Long productIdLong = Long.parseLong(productId);
                    Optional<Product> productOpt = productRepository.findById(productIdLong);
                    if (productOpt.isPresent()) {
                        Product product = productOpt.get();
                        sellerEmail = product.getSellerEmail();
                        productName = product.getName();
                        shopName = product.getShopName();
                    } else {
                        return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid product ID format"));
                }
            } else {
                // If productId not provided, fallback to first item's seller info if available
                if (!order.getItems().isEmpty()) {
                    Order.OrderItem firstItem = order.getItems().get(0);
                    sellerEmail = firstItem.getSellerEmail();
                    productName = "N/A";
                    shopName = firstItem.getShopName();
                }
            }

            if (sellerEmail == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Seller information not found for feedback"));
            }

            // Check if feedback already exists for this order, product, and customer
            boolean feedbackExists = feedbackRepository.existsByOrderIdAndProductIdAndCustomerEmail(orderIdLong, productId, customerEmail);
            if (feedbackExists) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback already submitted for this product in the order"));
            }

            // Create and save feedback entity
            com.ecobazaar.model.Feedback feedbackEntity = new com.ecobazaar.model.Feedback();
            feedbackEntity.setOrderId(orderIdLong);
            feedbackEntity.setCustomerEmail(customerEmail);
            feedbackEntity.setCustomerName(customerEmail); // Use email as name for now
            feedbackEntity.setSellerEmail(sellerEmail);
            feedbackEntity.setProductId(productId);
            feedbackEntity.setProductName(productName);
            feedbackEntity.setShopName(shopName);
            feedbackEntity.setFeedbackText(feedbackText);
            // Optionally set rating if provided
            if (feedbackData.containsKey("rating")) {
                Object ratingObj = feedbackData.get("rating");
                if (ratingObj instanceof Integer) {
                    feedbackEntity.setRating((Integer) ratingObj);
                } else if (ratingObj instanceof String) {
                    try {
                        feedbackEntity.setRating(Integer.parseInt((String) ratingObj));
                    } catch (NumberFormatException ignored) {}
                }
            }

            feedbackRepository.save(feedbackEntity);

            logger.info("Feedback saved for order {} by customer {}: {}", orderIdStr, customerEmail, feedbackText);

            return ResponseEntity.ok(Map.of(
                "message", "Feedback submitted successfully",
                "orderId", orderIdStr
            ));
        } catch (Exception e) {
            logger.error("Failed to submit feedback", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit feedback: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getSellerFeedback(String sellerEmail) {
        try {
            List<com.ecobazaar.model.Feedback> feedbackList = feedbackRepository.findBySellerEmailOrderByCreatedAtDesc(sellerEmail);

            // Calculate average rating
            Double averageRating = feedbackRepository.findAverageRatingBySellerEmail(sellerEmail);
            Long totalFeedback = feedbackRepository.countBySellerEmail(sellerEmail);

            Map<String, Object> response = Map.of(
                "feedback", feedbackList,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "totalFeedback", totalFeedback
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch seller feedback", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch feedback: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getCustomerFeedback(String customerEmail) {
        try {
            List<com.ecobazaar.model.Feedback> feedbackList = feedbackRepository.findByCustomerEmail(customerEmail);

            return ResponseEntity.ok(Map.of("feedback", feedbackList));
        } catch (Exception e) {
            logger.error("Failed to fetch customer feedback", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch feedback: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getProductFeedback(String productId) {
        try {
            List<com.ecobazaar.model.Feedback> feedbackList = feedbackRepository.findByProductIdOrderByCreatedAtDesc(productId);

            // Calculate average rating for the product
            Double averageRating = feedbackRepository.findAverageRatingByProductId(productId);
            Long totalFeedback = feedbackRepository.countByProductId(productId);

            Map<String, Object> response = Map.of(
                "feedback", feedbackList,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "totalFeedback", totalFeedback
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch product feedback", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch feedback: " + e.getMessage()));
        }
    }

    public int getSellerOrderCount(String sellerEmail) {
        try {
            // Get all products by this seller
            List<Product> sellerProducts = productRepository.findBySellerEmail(sellerEmail);

            // Extract product IDs
            List<Long> sellerProductIds = sellerProducts.stream()
                .map(Product::getId)
                .toList();

            // Find all orders and count those containing seller's products
            List<Order> allOrders = orderRepository.findAll();
            long orderCount = allOrders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> {
                        Long itemProductId;
                        try {
                            itemProductId = Long.parseLong(item.getProductId());
                        } catch (NumberFormatException e) {
                            return false;
                        }
                        return sellerProductIds.contains(itemProductId);
                    }))
                .count();

            return (int) orderCount;
        } catch (Exception e) {
            logger.error("Failed to get seller order count", e);
            return 0;
        }
    }
}
