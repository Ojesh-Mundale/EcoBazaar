package com.ecobazaar.model;

import java.util.List;

public class AssistantResponse {
    private String text;
    private List<Product> products;

    public AssistantResponse() {
    }

    public AssistantResponse(String text, List<Product> products) {
        this.text = text;
        this.products = products;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
