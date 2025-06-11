package com.nelson.proyekoop.controller;

import com.nelson.proyekoop.dto.ApiResponse;
import com.nelson.proyekoop.model.PowerUp;
import com.nelson.proyekoop.repository.PowerUpRepository;
import com.nelson.proyekoop.service.UserService;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.model.UserPowerUp;
import com.nelson.proyekoop.service.UserPowerUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/powerups")
public class PowerUpController {
    private final PowerUpRepository powerUpRepository;
    private final UserService userService;
    private final UserPowerUpService userPowerUpService;

    @Autowired
    public PowerUpController(PowerUpRepository powerUpRepository, UserService userService, UserPowerUpService userPowerUpService) {
        this.powerUpRepository = powerUpRepository;
        this.userService = userService;
        this.userPowerUpService = userPowerUpService;
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
        userPowerUpService.addOrIncrementUserPowerUp(user, powerUp);
        return ResponseEntity.ok(new ApiResponse<>(true, "Power-up purchased", null));
    }

    @GetMapping("/owned/{userId}")
    public ResponseEntity<ApiResponse<List<UserPowerUpDTO>>> getUserOwnedPowerUps(@PathVariable Long userId) {
        List<UserPowerUp> userPowerUps = userPowerUpService.getUserPowerUps(userId);
        List<UserPowerUpDTO> dtos = userPowerUps.stream().map(up -> new UserPowerUpDTO(
            up.getPowerUp().getId(),
            up.getPowerUp().getName(),
            up.getQuantity()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "User power-ups fetched", dtos));
    }

    @PostMapping("/use/{userId}/{powerUpId}")
    public ResponseEntity<ApiResponse<String>> usePowerUp(@PathVariable Long userId, @PathVariable Long powerUpId) {
        User user = userService.getEntityById(userId);
        PowerUp powerUp = powerUpRepository.findById(powerUpId).orElse(null);
        if (powerUp == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Power-up not found", null));
        }
        userPowerUpService.decrementUserPowerUp(user, powerUp);
        return ResponseEntity.ok(new ApiResponse<>(true, "Power-up used", null));
    }

    public static class UserPowerUpDTO {
        private Long powerUpId;
        private String powerUpName;
        private Integer quantity;
        public UserPowerUpDTO(Long powerUpId, String powerUpName, Integer quantity) {
            this.powerUpId = powerUpId;
            this.powerUpName = powerUpName;
            this.quantity = quantity;
        }
        public Long getPowerUpId() { return powerUpId; }
        public String getPowerUpName() { return powerUpName; }
        public Integer getQuantity() { return quantity; }
    }
}
