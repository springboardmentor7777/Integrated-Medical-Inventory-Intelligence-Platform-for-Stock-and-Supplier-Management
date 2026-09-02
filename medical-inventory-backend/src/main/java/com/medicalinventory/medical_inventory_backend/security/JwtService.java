package com.medicalinventory.medical_inventory_backend.security;
import com.medicalinventory.medical_inventory_backend.model.User;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service;
import javax.crypto.SecretKey; import java.time.Instant; import java.util.Base64; import java.util.Date; import java.util.List;

@Service public class JwtService {
 private final SecretKey key; private final long expirationMs;
 public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) { this.key=Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret)); this.expirationMs=expirationMs; }
 public String generate(User user) { List<String> roles=user.getRoles().stream().map(r->r.getName().name()).toList(); Instant now=Instant.now(); return Jwts.builder().subject(user.getEmail()).claim("roles",roles).issuedAt(Date.from(now)).expiration(Date.from(now.plusMillis(expirationMs))).signWith(key).compact(); }
 public String subject(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject(); }
}
