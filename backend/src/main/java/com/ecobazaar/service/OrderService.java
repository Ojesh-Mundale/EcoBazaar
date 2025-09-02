package com.ecobazaar.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Order;
import com.ecobazaar.model.Product;
import com.ecobazaar.repository.OrderRepository;
import com.ecobazaar.repository.ProductRepository;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<?> createOrder(Order order, String customerEmail) {
        try {
            logger.info("Creating order for customer: {}", customerEmail);

            // Set customer email
            order.setCustomerEmail(customerEmail);

            // Generate tracking number
            order.setTrackingNumber("EB" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            // Validate and update inventory, and populate seller information
            for (Order.OrderItem item : order.getItems()) {
                Optional<Product> product = productRepository.findById(item.getProductId());
                if (product.isPresent()) {
                    Product p = product.get();
                    if (p.getInventory() < item.getQuantity()) {
                        return ResponseEntity.badRequest().body(Map.of(
                            "error", "Insufficient inventory for product: " + p.getName()
                        ));
                    }
                    // Populate seller information in the order item
                    item.setShopName(p.getShopName());
                    // Note: We can't directly set sellerEmail in OrderItem as it doesn't have this field
                    // We'll need to modify OrderItem or use shopName for filtering

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

            logger.info("Order created successfully with id: {}", savedOrder.getId());

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
            Optional<Order> order = orderRepository.findById(orderId);

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
            Optional<Order> orderOpt = orderRepository.findById(orderId);

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
                        Optional<Product> product = productRepository.findById(item.getProductId());
                        if (product.isPresent()) {
                            Product p = product.get();
                            p.setInventory(p.getInventory() + item.getQuantity());
                            productRepository.save(p);
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

            Optional<Order> orderOpt = orderRepository.findById(orderId);

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                logger.info("Found order with current status: {}", order.getStatus());

                // Check if the seller owns any products in this order
                boolean sellerOwnsProduct = order.getItems().stream()
                    .anyMatch(item -> {
                        Optional<Product> product = productRepository.findById(item.getProductId());
                        if (product.isPresent()) {
                            String productSellerEmail = product.get().getSellerEmail();
                            logger.info("Product {} belongs to seller {}", item.getProductId(), productSellerEmail);
                            return productSellerEmail != null && productSellerEmail.equals(sellerEmail);
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
            List<String> sellerProductIds = sellerProducts.stream()
                .map(Product::getId)
                .toList();

            // Find all orders and filter those containing seller's products
            List<Order> allOrders = orderRepository.findAll();
            List<Order> sellerOrders = allOrders.stream()
                .filter(order -> order.getItems().stream()
                    .anyMatch(item -> sellerProductIds.contains(item.getProductId())))
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate())) // Sort by date desc
                .toList();

            return ResponseEntity.ok(Map.of(
                "orders", sellerOrders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch seller orders: " + e.getMessage()));
        }
    }
}
