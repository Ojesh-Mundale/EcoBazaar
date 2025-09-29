package com.ecobazaar.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecobazaar.model.Product;
import com.ecobazaar.repository.ProductRepository;

@Service
public class SimpleChatService {

    @Autowired
    private ProductRepository productRepository;

    public String processQuery(String query) {
        String lowerQuery = query.toLowerCase();

        // Check for carbon footprint queries
        if (lowerQuery.contains("carbon footprint") || lowerQuery.contains("carbon") || lowerQuery.contains("eco")) {
            return handleCarbonFootprintQuery(query);
        }

        // Check for price-based queries
        if (lowerQuery.contains("price") || lowerQuery.contains("cheap") || lowerQuery.contains("budget") || lowerQuery.contains("affordable")) {
            return handlePriceQuery(query);
        }

        // Check for category-specific queries
        if (lowerQuery.contains("clothing") || lowerQuery.contains("clothes") || lowerQuery.contains("fashion")) {
            return handleCategoryQuery("clothing");
        }

        if (lowerQuery.contains("electronics") || lowerQuery.contains("tech") || lowerQuery.contains("gadget")) {
            return handleCategoryQuery("electronics");
        }

        if (lowerQuery.contains("home") || lowerQuery.contains("household") || lowerQuery.contains("kitchen")) {
            return handleCategoryQuery("home");
        }

        // Default response
        return "I'm here to help you find eco-friendly products! You can ask me about:\n" +
               "• Products with low carbon footprint\n" +
               "• Budget-friendly eco products\n" +
               "• Specific categories like clothing, electronics, or home goods\n" +
               "• Products under a certain price\n\n" +
               "What are you looking for?";
    }

    private String handleCarbonFootprintQuery(String query) {
        List<Product> lowCarbonProducts = productRepository.findByCarbonFootprintLessThan(0.5);

        if (lowCarbonProducts.isEmpty()) {
            return "I couldn't find any products with carbon footprint less than 0.5 kg CO2. " +
                   "Try asking for products under a higher carbon footprint limit or check our other eco-friendly options.";
        }

        StringBuilder response = new StringBuilder();
        response.append("Here are some eco-friendly products with low carbon footprint (< 0.5 kg CO2):\n\n");

        int count = 0;
        for (Product product : lowCarbonProducts) {
            if (count >= 5) break; // Limit to 5 products
            response.append(String.format("• **%s** - $%.2f\n", product.getName(), product.getPrice()));
            response.append(String.format("  Carbon footprint: %.2f kg CO2\n", product.getCarbonFootprint()));
            if (product.getEcoRating() != null) {
                response.append(String.format("  Eco rating: %s\n", product.getEcoRating()));
            }
            response.append(String.format("  Category: %s\n\n", product.getCategory()));
            count++;
        }

        response.append(String.format("Found %d eco-friendly products. You can ask for more details about any specific product!", lowCarbonProducts.size()));
        return response.toString();
    }

    private String handlePriceQuery(String query) {
        // Extract price limit from query
        double priceLimit = extractPriceFromQuery(query);

        if (priceLimit <= 0) {
            priceLimit = 50.0; // Default price limit
        }

        List<Product> affordableProducts = productRepository.findByPriceLessThan(priceLimit);

        if (affordableProducts.isEmpty()) {
            return String.format("I couldn't find any products under $%.2f. Try a higher price limit or ask about our eco-friendly options.", priceLimit);
        }

        StringBuilder response = new StringBuilder();
        response.append(String.format("Here are some affordable eco-friendly products under $%.2f:\n\n", priceLimit));

        int count = 0;
        for (Product product : affordableProducts) {
            if (count >= 5) break; // Limit to 5 products
            response.append(String.format("• **%s** - $%.2f\n", product.getName(), product.getPrice()));
            response.append(String.format("  Carbon footprint: %.2f kg CO2\n", product.getCarbonFootprint()));
            if (product.getEcoRating() != null) {
                response.append(String.format("  Eco rating: %s\n", product.getEcoRating()));
            }
            response.append(String.format("  Category: %s\n\n", product.getCategory()));
            count++;
        }

        response.append(String.format("Found %d affordable products. You can ask for products in a different price range!", affordableProducts.size()));
        return response.toString();
    }

    private String handleCategoryQuery(String category) {
        List<Product> categoryProducts = productRepository.findByCategory(category);

        if (categoryProducts.isEmpty()) {
            return String.format("I couldn't find any products in the %s category. Try asking about other categories like electronics, home goods, or general eco-friendly products.", category);
        }

        StringBuilder response = new StringBuilder();
        response.append(String.format("Here are some eco-friendly %s products:\n\n", category));

        int count = 0;
        for (Product product : categoryProducts) {
            if (count >= 5) break; // Limit to 5 products
            response.append(String.format("• **%s** - $%.2f\n", product.getName(), product.getPrice()));
            response.append(String.format("  Carbon footprint: %.2f kg CO2\n", product.getCarbonFootprint()));
            if (product.getEcoRating() != null) {
                response.append(String.format("  Eco rating: %s\n", product.getEcoRating()));
            }
            response.append(String.format("  Materials: %s\n\n", product.getMaterials()));
            count++;
        }

        response.append(String.format("Found %d products in this category. You can ask for products with low carbon footprint or under a specific price!", categoryProducts.size()));
        return response.toString();
    }

    private double extractPriceFromQuery(String query) {
        // Look for price patterns like "$50", "under 100", "less than 75"
        Pattern pricePattern = Pattern.compile("(\\$?\\d+\\.?\\d*)|under\\s+(\\d+)|less\\s+than\\s+(\\d+)");
        Matcher matcher = pricePattern.matcher(query);

        double maxPrice = 0;
        while (matcher.find()) {
            try {
                if (matcher.group(1) != null) {
                    String priceStr = matcher.group(1).replace("$", "");
                    double price = Double.parseDouble(priceStr);
                    if (price > maxPrice) maxPrice = price;
                } else if (matcher.group(2) != null) {
                    double price = Double.parseDouble(matcher.group(2));
                    if (price > maxPrice) maxPrice = price;
                } else if (matcher.group(3) != null) {
                    double price = Double.parseDouble(matcher.group(3));
                    if (price > maxPrice) maxPrice = price;
                }
            } catch (NumberFormatException e) {
                // Ignore invalid numbers
            }
        }

        return maxPrice;
    }

    public List<Product> getProductsByCriteria(String criteria, double value) {
        switch (criteria.toLowerCase()) {
            case "carbon":
            case "carbonfootprint":
                return productRepository.findByCarbonFootprintLessThan(value);
            case "price":
                return productRepository.findByPriceLessThan(value);
            default:
                return new ArrayList<>();
        }
    }
}
