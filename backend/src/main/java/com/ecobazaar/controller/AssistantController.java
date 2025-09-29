package com.ecobazaar.controller;

import java.util.List;

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

    @PostMapping("/ask")
    public ResponseEntity<AssistantResponse> ask(@RequestBody AskRequest body) {
        try {
            String query = body.getQuery();
            float[] qEmb = geminiService.getEmbedding(query);
            List<Product> prodHits = vectorSearch.searchProducts(qEmb, 4);
            List<FaqDoc> faqHits = vectorSearch.searchFaqs(qEmb, 3);
            String context = buildContext(prodHits, faqHits);
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

    private String buildContext(List<Product> products, List<FaqDoc> faqs) {
        StringBuilder sb = new StringBuilder();
        sb.append("Here are some product options:\n");
        for (Product p : products) {
            sb.append(String.format("Product: %s — benefit: %s, price: %.2f\n", p.getName(), p.getEcoRating(), p.getPrice()));
        }
        sb.append("\nFAQ:\n");
        for (FaqDoc f : faqs) {
            sb.append(String.format("Q: %s — A: %s\n", f.getQuestion(), f.getAnswer()));
        }
        return sb.toString();
    }

    private String promptTemplate(String userQuery, String context) {
        return "You are EcoBazaar’s virtual eco-assistant. Use the context provided below (product options + FAQ info) to help the user. " +
               "If the user asks for product recommendations, include up to 4 products from the options with name, price, and a short eco-benefit. " +
               "If they ask general questions, use FAQ info and context. Here is the context:\n\n" +
               context + "\nUser: " + userQuery + "\nAnswer clearly and helpfully.";
    }
}
