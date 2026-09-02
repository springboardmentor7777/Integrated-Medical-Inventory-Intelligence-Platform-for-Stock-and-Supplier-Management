package com.medicalinventory.medical_inventory_backend.repository;
import com.medicalinventory.medical_inventory_backend.model.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long> { Optional<User> findByEmail(String email); boolean existsByEmail(String email); }
