package com.example.medicalinventory.controller;

import org.springframework.web.bind.annotation.*;

import com.example.medicalinventory.model.LoginRequest;
import com.example.medicalinventory.model.User;
import com.example.medicalinventory.security.JwtService;
import com.example.medicalinventory.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        return jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }
}