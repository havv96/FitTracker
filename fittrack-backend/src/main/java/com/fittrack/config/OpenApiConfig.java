package com.fittrack.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger Configuration
 * Provides comprehensive API documentation for FitTrack Pro
 */
@Configuration
public class OpenApiConfig {

    @Value("${app.api.version:1.0.0}")
    private String apiVersion;

    @Value("${app.api.server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${app.api.server-description:Development Server}")
    private String serverDescription;

    @Bean
    public OpenAPI fitTrackOpenAPI() {
        // JWT Security Scheme
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("FitTrack Pro API")
                        .description("""
                                RESTful API for FitTrack Pro - Comprehensive Fitness & Health Tracking Platform

                                ## Features
                                - 🔐 JWT-based authentication with access and refresh tokens
                                - 💪 Workout tracking with exercises, sets, and progressive overload suggestions
                                - 🥗 Nutrition logging with macro tracking and daily summaries
                                - 📊 Health metrics: water intake, weight tracking, and dashboard analytics
                                - 📧 Smart reminders for inactivity and workout streaks
                                - 👤 User profiles with personalized goals and calculations

                                ## User Stories Implemented
                                - US-01 to US-17: Complete implementation of all core features

                                ## Authentication
                                Most endpoints require JWT authentication. Include the access token in the Authorization header:
                                ```
                                Authorization: Bearer <your-access-token>
                                ```
                                """)
                        .version(apiVersion)
                        .contact(new Contact()
                                .name("FitTrack Pro Team")
                                .email("support@fittrack.com")
                                .url("https://fittrack.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url(serverUrl)
                                .description(serverDescription)
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT access token obtained from /api/v1/auth/login or /api/v1/auth/register")));
    }
}
