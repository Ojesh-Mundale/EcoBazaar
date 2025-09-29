package com.ecobazaar.model;

import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private double price;
    private String category;
    private String materials;
    private String manufacturing;
    private String shippingMethod;
    @ElementCollection
    private List<String> ecoTags;
    private double carbonFootprint;
    private String sellerEmail;
    private String shopName;  // Added shopName field
    private String ecoRating; // Eco rating like A, B, C, A+
    private double rating; // Average customer rating
    private int inventory;
    @ElementCollection
    private List<String> imageUrls; // URLs for product images
    private boolean isActive;

    // Embedding vector for Gemini embeddings
    // Using a simple String to store serialized embedding for simplicity; can be changed to a more suitable type or handled by vector DB
    private String embedding;
    
    // Default constructor
    public Product() {
        this.isActive = true;
    }
    
    // Constructor with parameters
    public Product(String name, String description, double price, String category, 
                  String materials, String manufacturing, String shippingMethod, 
                  List<String> ecoTags, double carbonFootprint, String sellerEmail, String shopName, int inventory) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.materials = materials;
        this.manufacturing = manufacturing;
        this.shippingMethod = shippingMethod;
        this.ecoTags = ecoTags;
        this.carbonFootprint = carbonFootprint;
        this.sellerEmail = sellerEmail;
        this.shopName = shopName;
        this.inventory = inventory;
        this.isActive = true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public double getPrice() {
        return price;
    }
    
    public void setPrice(double price) {
        this.price = price;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getMaterials() {
        return materials;
    }
    
    public void setMaterials(String materials) {
        this.materials = materials;
    }
    
    public String getManufacturing() {
        return manufacturing;
    }
    
    public void setManufacturing(String manufacturing) {
        this.manufacturing = manufacturing;
    }
    
    public String getShippingMethod() {
        return shippingMethod;
    }
    
    public void setShippingMethod(String shippingMethod) {
        this.shippingMethod = shippingMethod;
    }
    
    public List<String> getEcoTags() {
        return ecoTags;
    }
    
    public void setEcoTags(List<String> ecoTags) {
        this.ecoTags = ecoTags;
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
    
    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getEcoRating() {
        return ecoRating;
    }

    public void setEcoRating(String ecoRating) {
        this.ecoRating = ecoRating;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getInventory() {
        return inventory;
    }
    
    public void setInventory(int inventory) {
        this.inventory = inventory;
    }
    
    public List<String> getImageUrls() {
        return imageUrls;
    }
    
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    
    public boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public String getEmbedding() {
        return embedding;
    }

    public void setEmbedding(String embedding) {
        this.embedding = embedding;
    }
}
