package com.nelson.proyekoop.controller;

import com.nelson.proyekoop.dto.ApiResponse;
import com.nelson.proyekoop.dto.UserDTO;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.repository.UserRepository;
import com.nelson.proyekoop.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty() || !passwordEncoder.matches(password, userOptional.get().getPassword())) {
            ApiResponse<Map<String, Object>> errorResponse = new ApiResponse<>(false, "Invalid username or password", null);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        User user = userOptional.get();
        String jwt = jwtUtils.generateToken(username);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("highestScore", user.getHighestScore());

        ApiResponse<Map<String, Object>> successResponse = new ApiResponse<>(true, "Login successful", response);
        return ResponseEntity.ok(successResponse);
    }
}
