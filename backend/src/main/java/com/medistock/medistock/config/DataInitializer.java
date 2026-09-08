package com.medistock.medistock.config;

import com.medistock.medistock.entity.Role;
import com.medistock.medistock.repository.RoleRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeRoles(
            RoleRepository roleRepository
    ) {

        return args -> {

            createRole(roleRepository, "ADMIN");
            createRole(roleRepository, "PHARMACIST");
            createRole(roleRepository, "STAFF");
        };
    }

    private void createRole(
            RoleRepository repository,
            String roleName
    ) {

        if (repository.findByName(roleName).isEmpty()) {

            repository.save(
                    new Role(roleName)
            );
        }
    }
}