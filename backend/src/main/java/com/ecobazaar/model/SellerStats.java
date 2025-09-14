package com.ecobazaar.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "seller_details")
public class SellerStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sellerEmail;
    private int totalSales;
    private double totalRevenue;
    private double carbonFootprint;
    private double rating;
    private double pendingPayouts;
    private int completedOrder;
    private int returnedOrder;
    private String ecoBadge;
    private int leaderboardPosition;

    // Default constructor
    public SellerStats() {}

    // Constructor with sellerEmail
    public SellerStats(String sellerEmail) {
        this.sellerEmail = sellerEmail;
        this.totalSales = 0;
        this.totalRevenue = 0.00;
        this.carbonFootprint = 0.0;
        this.rating = 4.8;
        this.pendingPayouts = 0.00;
        this.completedOrder = 0;
        this.returnedOrder = 0;
        this.ecoBadge = "Eco Beginner";
        this.leaderboardPosition = 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public int getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(int totalSales) {
        this.totalSales = totalSales;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getCarbonFootprint() {
        return carbonFootprint;
    }

    public void setCarbonFootprint(double carbonFootprint) {
        this.carbonFootprint = carbonFootprint;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public double getPendingPayouts() {
        return pendingPayouts;
    }

    public void setPendingPayouts(double pendingPayouts) {
        this.pendingPayouts = pendingPayouts;
    }

    public int getCompletedOrder() {
        return completedOrder;
    }

    public void setCompletedOrder(int completedOrder) {
        this.completedOrder = completedOrder;
    }

    public int getReturnedOrder() {
        return returnedOrder;
    }

    public void setReturnedOrder(int returnedOrder) {
        this.returnedOrder = returnedOrder;
    }

    public String getEcoBadge() {
        return ecoBadge;
    }

    public void setEcoBadge(String ecoBadge) {
        this.ecoBadge = ecoBadge;
    }

    public int getLeaderboardPosition() {
        return leaderboardPosition;
    }

    public void setLeaderboardPosition(int leaderboardPosition) {
        this.leaderboardPosition = leaderboardPosition;
    }
}
