package com.example.medicalinventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.medicalinventory.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}