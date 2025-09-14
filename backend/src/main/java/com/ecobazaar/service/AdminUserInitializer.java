package com.ecobazaar.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Admin user initialization removed - User table no longer used
    }
}
