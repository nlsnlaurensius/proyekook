package com.nelson.proyekoop.controller;

import com.nelson.proyekoop.dto.ApiResponse;
import com.nelson.proyekoop.model.PowerUp;
import com.nelson.proyekoop.repository.PowerUpRepository;
import com.nelson.proyekoop.service.UserService;
import com.nelson.proyekoop.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/powerups")
public class PowerUpController {
    private final PowerUpRepository powerUpRepository;
    private final UserService userService;

    @Autowired
    public PowerUpController(PowerUpRepository powerUpRepository, UserService userService) {
        this.powerUpRepository = powerUpRepository;
        this.userService = userService;
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<PowerUp>>> getAllPowerUps() {
        List<PowerUp> powerUps = powerUpRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Power-ups fetched", powerUps));
    }

    @PostMapping("/buy/{userId}/{powerUpId}")
    public ResponseEntity<ApiResponse<String>> buyPowerUp(@PathVariable Long userId, @PathVariable Long powerUpId) {
        User user = userService.getEntityById(userId);
        PowerUp powerUp = powerUpRepository.findById(powerUpId).orElse(null);
        if (powerUp == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Power-up not found", null));
        }
        if (user.getCoin() < powerUp.getPrice()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Not enough coins", null));
        }
        user.setCoin(user.getCoin() - powerUp.getPrice());
        userService.saveUser(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Power-up purchased", null));
    }
}
