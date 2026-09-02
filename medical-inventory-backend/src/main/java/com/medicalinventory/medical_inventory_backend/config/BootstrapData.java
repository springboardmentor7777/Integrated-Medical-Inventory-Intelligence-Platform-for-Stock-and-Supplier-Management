package com.medicalinventory.medical_inventory_backend.config;
import com.medicalinventory.medical_inventory_backend.model.*; import com.medicalinventory.medical_inventory_backend.repository.*;
import org.springframework.beans.factory.annotation.Value; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration; import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class BootstrapData {
 @Bean CommandLineRunner seedRoles(RoleRepository roles,UserRepository users,PasswordEncoder encoder,@Value("${BOOTSTRAP_ADMIN_EMAIL:}") String email,@Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password){return args->{for(var name:RoleName.values())roles.findByName(name).orElseGet(()->roles.save(new Role(name))); if(!email.isBlank()&&!password.isBlank()&&!users.existsByEmail(email.toLowerCase())){var admin=new User("System Administrator",email,encoder.encode(password));admin.getRoles().add(roles.findByName(RoleName.ADMIN).orElseThrow());users.save(admin);}};}
}
