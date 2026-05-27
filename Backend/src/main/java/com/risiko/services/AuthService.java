package com.risiko.services;

import com.risiko.exception.AppException;
import com.risiko.model.User;
import com.risiko.repository.UserRepository;
import com.risiko.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public String register(String username, String email, String password) {
        if (userRepository.existsByEmail(email)) throw new AppException(HttpStatus.CONFLICT, "Email exists");
        if (userRepository.existsByUsername(username)) throw new AppException(HttpStatus.CONFLICT, "Username exists");
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(password));
        u = userRepository.save(u);
        return jwtUtil.generateToken(u.getEmail(), u.getId());
    }

    public String login(String email, String password) {
        User u = userRepository.findByEmail(email).orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(password, u.getPassword())) throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        return jwtUtil.generateToken(u.getEmail(), u.getId());
    }

    @Transactional
    public User updateUsername(String username) {
        String normalizedUsername = username == null ? "" : username.trim();

        if (normalizedUsername.isBlank()) {
            throw new IllegalArgumentException("Username must not be blank");
        }

        User user = getUserFromAuth();

        if (!normalizedUsername.equals(user.getUsername()) && userRepository.existsByUsername(normalizedUsername)) {
            throw new AppException(HttpStatus.CONFLICT, "Username exists");
        }

        user.setUsername(normalizedUsername);
        return userRepository.save(user);
    }
      
    public User getUserFromAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }

        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }
    
}
