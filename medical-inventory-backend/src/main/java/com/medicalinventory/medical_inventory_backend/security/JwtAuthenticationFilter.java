package com.medicalinventory.medical_inventory_backend.security;
import com.medicalinventory.medical_inventory_backend.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain; import jakarta.servlet.ServletException; import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
@Component public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtService jwt; private final UserRepository users; public JwtAuthenticationFilter(JwtService jwt,UserRepository users){this.jwt=jwt;this.users=users;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException { String h=request.getHeader("Authorization"); if(h!=null&&h.startsWith("Bearer ")&&SecurityContextHolder.getContext().getAuthentication()==null) try { var user=users.findByEmail(jwt.subject(h.substring(7))).orElse(null); if(user!=null&&user.isEnabled()){var a=user.getRoles().stream().map(r->new SimpleGrantedAuthority("ROLE_"+r.getName())).toList(); SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user.getEmail(),null,a));}} catch(JwtException|IllegalArgumentException ignored) {} chain.doFilter(request,response); }
}
