package com.medistock.config;

import com.medistock.security.CustomAccessDeniedHandler;
import com.medistock.security.CustomUserDetailsService;
import com.medistock.security.JwtAuthenticationEntryPoint;
import com.medistock.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // ── Public endpoints ─────────────────────────────────────────────
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── User profile (any authenticated user) ───────────────────────
                        .requestMatchers("/api/v1/users/me").authenticated()

                        // ── User management (ADMIN only) ────────────────────────────────
                        .requestMatchers("/api/v1/users", "/api/v1/users/**").hasRole("ADMIN")

                        // ── Dashboard (any authenticated user can view) ──────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/dashboard/**").authenticated()

                        // ── Inventory — READ: all authenticated; WRITE: ADMIN/INV_MGR/PHARMACIST ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/inventory/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/inventory/**")
                                .hasAnyRole("ADMIN", "INVENTORY_MANAGER", "PHARMACIST")

                        // ── Suppliers — READ: all authenticated; WRITE: ADMIN/INV_MGR; DELETE: ADMIN ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/suppliers/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/suppliers/**")
                                .hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/suppliers/**")
                                .hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/suppliers/**").hasRole("ADMIN")

                        // ── Purchase Orders — READ: all auth; CREATE/STATUS: ADMIN/INV_MGR/PHARMACIST ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/purchases/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/purchases/**")
                                .hasAnyRole("ADMIN", "INVENTORY_MANAGER", "PHARMACIST")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/purchases/**")
                                .hasAnyRole("ADMIN", "INVENTORY_MANAGER")

                        // ── Expiry — READ: all authenticated; REFRESH (POST): ADMIN only ───────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/expiry/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/expiry/refresh").hasRole("ADMIN")

                        // ── Catch-all: any other API request must be authenticated ───────
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
