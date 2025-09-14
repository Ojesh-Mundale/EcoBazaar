package com.ecobazaar.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ecobazaar.model.Product;
import com.ecobazaar.repository.ProductRepository;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<?> addProduct(Product product, String sellerEmail) {
        try {
            logger.info("Adding product for seller: {}", sellerEmail);
            logger.info("Product details: {}", product);

            // Set the seller email for the product
            product.setSellerEmail(sellerEmail);
            
            // Save the product to the database
            Product savedProduct = productRepository.save(product);
            
            logger.info("Product saved successfully with id: {}", savedProduct.getId());

            return ResponseEntity.ok(Map.of(
                "message", "Product added successfully",
                "product", savedProduct
            ));
        } catch (Exception e) {
            logger.error("Failed to add product", e);
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
            Long productIdLong;
            try {
                productIdLong = Long.parseLong(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid product ID format"));
            }
            Optional<Product> product = productRepository.findByIdAndSellerEmail(productIdLong, sellerEmail);

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
            Long productIdLong;
            try {
                productIdLong = Long.parseLong(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid product ID format"));
            }
            Optional<Product> existingProduct = productRepository.findByIdAndSellerEmail(productIdLong, sellerEmail);
            
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
                productToUpdate.setShopName(product.getShopName());
                productToUpdate.setEcoTags(product.getEcoTags());
                productToUpdate.setCarbonFootprint(product.getCarbonFootprint());
                productToUpdate.setInventory(product.getInventory());
                if (product.getImageUrls() != null) {
                    productToUpdate.setImageUrls(product.getImageUrls());
                }
                
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
            Long productIdLong;
            try {
                productIdLong = Long.parseLong(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid product ID format"));
            }
            Optional<Product> product = productRepository.findByIdAndSellerEmail(productIdLong, sellerEmail);
            
            if (product.isPresent()) {
                Product productToDelete = product.get();
                // Instead of soft delete, perform hard delete from DB
                productRepository.delete(productToDelete);
                
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

    public ResponseEntity<byte[]> getProductImage(Long productId, int imageIndex) {
        try {
            Optional<Product> productOpt = productRepository.findById(productId);
            if (!productOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Product product = productOpt.get();
            List<String> imageUrls = product.getImageUrls();

            if (imageUrls == null || imageUrls.isEmpty() || imageIndex < 0 || imageIndex >= imageUrls.size()) {
                return ResponseEntity.badRequest().build();
            }

            String imageUrl = imageUrls.get(imageIndex);

            // Fetch image bytes from URL
            RestTemplate restTemplate = new RestTemplate();
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);

            // Determine content type (default to JPEG, can be improved with URL parsing)
            MediaType contentType = MediaType.IMAGE_JPEG;

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(imageBytes);

        } catch (Exception e) {
            logger.error("Failed to fetch image for product {} index {}", productId, imageIndex, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
