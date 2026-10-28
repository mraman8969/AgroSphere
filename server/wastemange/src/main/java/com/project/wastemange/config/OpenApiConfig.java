package com.project.wastemange.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reloopOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ReLoop — Farmer-to-Recycler Waste Management Platform API")
                        .description("REST API platform connecting farmers (exclusive suppliers of vegetable and agricultural waste) " +
                                "with recyclers, compost manufacturers, and organic-fertilizer producers. " +
                                "Supports material matching, location filtering, orders, and payment processing.")
                        .version("1.0.0")
                        .contact(new Contact().name("ReLoop Team").email("support@reloop.green"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .name("BearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token obtained from /api/auth/login or /api/auth/register")));
    }
}
