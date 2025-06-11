package com.nelson.proyekoop.controller;

import com.nelson.proyekoop.dto.ApiResponse;
import com.nelson.proyekoop.dto.UserDTO;
import com.nelson.proyekoop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        try {
            UserDTO userDTO = userService.registerUser(username, password, email);
            ApiResponse<UserDTO> response = new ApiResponse<>(true, "User registered successfully", userDTO);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException ex) {
            ApiResponse<UserDTO> response = new ApiResponse<>(false, ex.getMessage(), null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO userDTO = userService.getUserById(id);
        ApiResponse<UserDTO> response = new ApiResponse<>(true, "User fetched successfully", userDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        UserDTO userDTO = userService.getUserByUsername(username);
        ApiResponse<UserDTO> response = new ApiResponse<>(true, "User fetched successfully", userDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getLeaderboard() {
        // Ambil 10 user dengan skor tertinggi
        List<UserDTO> leaderboard = userService.getLeaderboard();
        ApiResponse<List<UserDTO>> response = new ApiResponse<>(true, "Leaderboard fetched successfully", leaderboard);
        return ResponseEntity.ok(response);
    }
}
