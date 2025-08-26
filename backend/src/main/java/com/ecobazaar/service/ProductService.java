package com.ecobazaar.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Product;
import com.ecobazaar.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<?> addProduct(Product product, String sellerEmail) {
        try {
            // Set the seller email for the product
            product.setSellerEmail(sellerEmail);
            
            // Save the product to the database
            Product savedProduct = productRepository.save(product);
            
            return ResponseEntity.ok(Map.of(
                "message", "Product added successfully",
                "product", savedProduct
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add product: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getProductsBySeller(String sellerEmail) {
        try {
            List<Product> products = productRepository.findBySellerEmailAndIsActive(sellerEmail, true);
            
            return ResponseEntity.ok(Map.of(
                "products", products
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch products: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getProductById(String id, String sellerEmail) {
        try {
            Optional<Product> product = productRepository.findByIdAndSellerEmail(id, sellerEmail);
            
            if (product.isPresent()) {
                return ResponseEntity.ok(Map.of("product", product.get()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch product: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> updateProduct(String id, Product product, String sellerEmail) {
        try {
            Optional<Product> existingProduct = productRepository.findByIdAndSellerEmail(id, sellerEmail);
            
            if (existingProduct.isPresent()) {
                Product productToUpdate = existingProduct.get();
                
                // Update the product fields
                productToUpdate.setName(product.getName());
                productToUpdate.setDescription(product.getDescription());
                productToUpdate.setPrice(product.getPrice());
                productToUpdate.setCategory(product.getCategory());
                productToUpdate.setMaterials(product.getMaterials());
                productToUpdate.setManufacturing(product.getManufacturing());
                productToUpdate.setShippingMethod(product.getShippingMethod());
                productToUpdate.setEcoTags(product.getEcoTags());
                productToUpdate.setCarbonFootprint(product.getCarbonFootprint());
                productToUpdate.setInventory(product.getInventory());
                
                Product updatedProduct = productRepository.save(productToUpdate);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Product updated successfully",
                    "product", updatedProduct
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update product: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> deleteProduct(String id, String sellerEmail) {
        try {
            Optional<Product> product = productRepository.findByIdAndSellerEmail(id, sellerEmail);
            
            if (product.isPresent()) {
                Product productToDelete = product.get();
                productToDelete.setIsActive(false);
                productRepository.save(productToDelete);
                
                return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete product: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productRepository.findByIsActive(true);
            return ResponseEntity.ok(Map.of("products", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch products: " + e.getMessage()));
        }
    }
}
