package com.ecobazaar.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class Product {
    
    @Id
    private String id;
    
    private String name;
    private String description;
    private double price;
    private String category;
    private String materials;
    private String manufacturing;
    private String shippingMethod;
    private List<String> ecoTags;
    private double carbonFootprint;
    private String sellerEmail;
    private int inventory;
    private boolean isActive;
    
    // Default constructor
    public Product() {
        this.isActive = true;
    }
    
    // Constructor with parameters
    public Product(String name, String description, double price, String category, 
                  String materials, String manufacturing, String shippingMethod, 
                  List<String> ecoTags, double carbonFootprint, String sellerEmail, int inventory) {
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
        this.inventory = inventory;
        this.isActive = true;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
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
    
    public int getInventory() {
        return inventory;
    }
    
    public void setInventory(int inventory) {
        this.inventory = inventory;
    }
    
    public boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
}
