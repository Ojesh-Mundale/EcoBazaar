package com.ecobazaar.model;

public class AskRequest {
    private String query;

    public AskRequest() {
    }

    public AskRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
