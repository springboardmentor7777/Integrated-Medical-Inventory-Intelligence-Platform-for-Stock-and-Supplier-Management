package com.medistock.dto.auth;

import com.medistock.dto.user.UserResponse;

public class LoginResponse {

    private String token;
    private String type = "Bearer";
    private UserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
