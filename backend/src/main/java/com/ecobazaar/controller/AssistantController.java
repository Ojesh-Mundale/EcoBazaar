package com.ecobazaar.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.model.AskRequest;
import com.ecobazaar.model.AssistantResponse;
import com.ecobazaar.model.FaqDoc;
import com.ecobazaar.model.Product;
import com.ecobazaar.service.AdminService;
import com.ecobazaar.service.GeminiService;
import com.ecobazaar.service.SimpleChatService;
import com.ecobazaar.service.VectorSearchService;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private VectorSearchService vectorSearch;

    @Autowired
    private SimpleChatService simpleChatService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/ask")
    public ResponseEntity<AssistantResponse> ask(@RequestBody AskRequest body) {
        try {
            String query = body.getQuery();
            float[] qEmb = geminiService.getEmbedding(query);
            List<Product> prodHits = vectorSearch.searchProducts(qEmb, 4);
            List<FaqDoc> faqHits = vectorSearch.searchFaqs(qEmb, 3);
            ResponseEntity<?> reportResponse = adminService.getCarbonEmissionReport();
            String context = buildContext(prodHits, faqHits, reportResponse);
            String fullPrompt = promptTemplate(query, context);

            String answerText = geminiService.generateReply(fullPrompt);

            AssistantResponse resp = new AssistantResponse(answerText, prodHits);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new AssistantResponse("Error processing request: " + e.getMessage(), null));
        }
    }

    @PostMapping("/simple-chat")
    public ResponseEntity<AssistantResponse> simpleChat(@RequestBody AskRequest body) {
        try {
            String query = body.getQuery();
            String responseText = simpleChatService.processQuery(query);

            // Return a simple response without products for the simple chat
            AssistantResponse resp = new AssistantResponse(responseText, null);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new AssistantResponse("Error processing request: " + e.getMessage(), null));
        }
    }

    private String buildContext(List<Product> products, List<FaqDoc> faqs, ResponseEntity<?> reportResponse) {
        StringBuilder sb = new StringBuilder();
        sb.append("Here are some product options:\n");
        for (Product p : products) {
            sb.append(String.format("Product: %s — price: %.2f, carbon footprint: %.2f kg CO2, materials: %s\n", p.getName(), p.getPrice(), p.getCarbonFootprint(), p.getMaterials()));
        }
        sb.append("\nFAQ:\n");
        for (FaqDoc f : faqs) {
            sb.append(String.format("Q: %s — A: %s\n", f.getQuestion(), f.getAnswer()));
        }
        if (reportResponse != null && reportResponse.getStatusCode().is2xxSuccessful()) {
            try {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> report = (java.util.Map<String, Object>) reportResponse.getBody();
                @SuppressWarnings("unchecked")
                java.util.List<AdminService.CarbonReportItem> reportData = (java.util.List<AdminService.CarbonReportItem>) report.get("reportData");
                sb.append("\nAnalytics:\n");
                for (int i = 0; i < Math.min(3, reportData.size()); i++) {
                    AdminService.CarbonReportItem item = reportData.get(i);
                    sb.append(String.format("Top seller %d: %s with %d products, %.2f kg CO2 total\n", i+1, item.getSellerEmail(), item.getProductCount(), item.getTotalCarbon()));
                }
                Double totalCarbon = (Double) report.get("totalCarbonEmissions");
                sb.append(String.format("Total carbon emissions across platform: %.2f kg CO2\n", totalCarbon));
            } catch (Exception e) {
                // Ignore analytics if error
            }
        }
        return sb.toString();
    }

    private String promptTemplate(String userQuery, String context) {
        return "You are EcoBazaar’s virtual eco-assistant. Use the context provided below (product options + FAQ info) to help the user. " +
               "If the user asks for product recommendations, respond in the format: Here are some eco-friendly products: • Product Name - $price Carbon footprint: footprint kg CO2 Materials: materials • ... Found X products in this category. You can ask for products with low carbon footprint or under a specific price! " +
               "If they ask general questions, use FAQ info and context. Here is the context:\n\n" +
               context + "\nUser: " + userQuery + "\nAnswer clearly and helpfully.";
    }
}
