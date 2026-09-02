package com.medicalinventory.medical_inventory_backend.auth;

import com.medicalinventory.medical_inventory_backend.model.*; import com.medicalinventory.medical_inventory_backend.repository.*; import com.medicalinventory.medical_inventory_backend.security.JwtService;
import jakarta.validation.Valid; import jakarta.validation.constraints.*;
import org.springframework.http.*; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;

@RestController @RequestMapping("/api/auth") public class AuthController {
 private final UserRepository users; private final RoleRepository roles; private final PasswordEncoder encoder; private final JwtService jwt;
 public AuthController(UserRepository users,RoleRepository roles,PasswordEncoder encoder,JwtService jwt){this.users=users;this.roles=roles;this.encoder=encoder;this.jwt=jwt;}
 @PostMapping("/register") public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){if(users.existsByEmail(request.email().toLowerCase()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered"); var user=new User(request.name(),request.email(),encoder.encode(request.password())); user.getRoles().add(role(RoleName.STAFF)); users.save(user); return ResponseEntity.status(HttpStatus.CREATED).body(response(user));}
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request){var user=users.findByEmail(request.email().toLowerCase()).filter(u->encoder.matches(request.password(),u.getPassword())).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password"));return response(user);}
 private Role role(RoleName name){return roles.findByName(name).orElseThrow();} private AuthResponse response(User u){return new AuthResponse(jwt.generate(u),new UserView(u.getId(),u.getName(),u.getEmail(),u.getRoles().stream().map(r->r.getName().name()).collect(java.util.stream.Collectors.toSet())));}
 public record RegisterRequest(@NotBlank @Size(max=120) String name,@NotBlank @Email String email,@NotBlank @Size(min=8,max=100) String password){}
 public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){}
 public record AuthResponse(String accessToken,UserView user){} public record UserView(Long id,String name,String email,Set<String> roles){}
}
