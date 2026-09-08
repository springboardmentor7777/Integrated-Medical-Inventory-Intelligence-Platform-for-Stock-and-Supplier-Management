package com.example.medicalinventory.config;

import com.example.medicalinventory.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Enable CORS & Disable CSRF because this is a REST API using JWT
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Allow all CORS preflight OPTIONS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Authentication APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // User management - ADMIN only
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Medicine APIs
                        .requestMatchers(HttpMethod.GET, "/api/medicines/**")
                        .hasAnyRole("ADMIN", "USER", "PHARMACIST", "STAFF")

                        .requestMatchers(HttpMethod.POST, "/api/medicines/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/medicines/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/medicines/**")
                        .hasRole("ADMIN")

                        // Stock IN - ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/stock/in")
                        .hasRole("ADMIN")

                        // Stock OUT - ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/stock/out")
                        .hasRole("ADMIN")

                        // Stock history - ADMIN and USER
                        .requestMatchers(HttpMethod.GET, "/api/stock/history")
                        .hasAnyRole("ADMIN", "USER", "PHARMACIST", "STAFF")

                        // Current stock - ADMIN and USER
                        .requestMatchers(HttpMethod.GET, "/api/stock/**")
                        .hasAnyRole("ADMIN", "USER", "PHARMACIST", "STAFF")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // Run JWT filter before Spring's username/password filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}