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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF because this is a REST API using JWT
                .csrf(csrf -> csrf.disable())

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Authentication APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // User management - ADMIN only
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Medicine APIs
                        .requestMatchers(HttpMethod.GET, "/api/medicines/**")
                        .hasAnyRole("ADMIN", "USER")

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
                        .hasAnyRole("ADMIN", "USER")

                        // Current stock - ADMIN and USER
                        .requestMatchers(HttpMethod.GET, "/api/stock/**")
                        .hasAnyRole("ADMIN", "USER")

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