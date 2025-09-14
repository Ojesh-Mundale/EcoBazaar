package com.ecobazaar.model;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerEmail;
    @ElementCollection
    private List<OrderItem> items;
    private double totalAmount;
    private String status; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private String shippingAddress;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private double carbonSaved;
    private String trackingNumber;

    // Default constructor
    public Order() {
        this.orderDate = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Constructor with parameters
    public Order(String customerEmail, List<OrderItem> items, double totalAmount,
                String shippingAddress, String paymentMethod) {
        this.customerEmail = customerEmail;
        this.items = items;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.orderDate = LocalDateTime.now();
        this.status = "PENDING";
        this.carbonSaved = calculateCarbonSaved();
    }

    // Calculate total carbon saved from all items
    private double calculateCarbonSaved() {
        if (items == null) return 0.0;
        return items.stream()
                .mapToDouble(item -> item.getCarbonFootprint() * item.getQuantity())
                .sum();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
        this.carbonSaved = calculateCarbonSaved();
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public double getCarbonSaved() {
        return carbonSaved;
    }

    public void setCarbonSaved(double carbonSaved) {
        this.carbonSaved = carbonSaved;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    // Inner class for order items
    @Embeddable
    public static class OrderItem {
        private String productId;
        private String productName;
        private String shopName;
        private String sellerEmail;
        private String category;
        private int quantity;
        private double price;
        private double carbonFootprint;

        public OrderItem() {}

        public OrderItem(String productId, String productName, String shopName, String sellerEmail, String category,
                        int quantity, double price, double carbonFootprint) {
            this.productId = productId;
            this.productName = productName;
            this.shopName = shopName;
            this.sellerEmail = sellerEmail;
            this.category = category;
            this.quantity = quantity;
            this.price = price;
            this.carbonFootprint = carbonFootprint;
        }

        // Getters and Setters
        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getShopName() {
            return shopName;
        }

        public void setShopName(String shopName) {
            this.shopName = shopName;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }

        public double getCarbonFootprint() {
            return carbonFootprint;
        }

        public void setCarbonFootprint(double carbonFootprint) {
            this.carbonFootprint = carbonFootprint;
        }

        public String getSellerEmail() {
            return sellerEmail;
        }

        public void setSellerEmail(String sellerEmail) {
            this.sellerEmail = sellerEmail;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }
}
