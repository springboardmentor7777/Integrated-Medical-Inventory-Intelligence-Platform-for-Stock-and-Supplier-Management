package com.medistock.repository;

import com.medistock.entity.User;
import com.medistock.enums.RoleName;
import com.medistock.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole_Name(RoleName roleName);
    List<User> findByStatus(UserStatus status);
}
