package com.medicalinventory.medical_inventory_backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, unique = true, length = 160) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private boolean enabled = true;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @ManyToMany(fetch = FetchType.EAGER) @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
    protected User() { }
    public User(String name, String email, String password) { this.name=name; this.email=email.toLowerCase(); this.password=password; }
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPassword(){return password;} public boolean isEnabled(){return enabled;} public Set<Role> getRoles(){return roles;}
}
