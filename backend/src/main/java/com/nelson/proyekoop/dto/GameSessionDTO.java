package com.nelson.proyekoop.dto;

import java.time.LocalDateTime;
import java.util.List;

public class GameSessionDTO {
    private Long id;
    private Long userId;
    private String username;
    private Integer score;
    private Integer coinsCollected;
    private Integer distanceTraveled;
    private LocalDateTime playedAt;
    private Long powerUpId;
    private Boolean isHighScore;
    private List<PowerUpUsageDTO> powerUps; // List power up yang diambil

    public GameSessionDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getCoinsCollected() {
        return coinsCollected;
    }

    public void setCoinsCollected(Integer coinsCollected) {
        this.coinsCollected = coinsCollected;
    }

    public Integer getDistanceTraveled() {
        return distanceTraveled;
    }

    public void setDistanceTraveled(Integer distanceTraveled) {
        this.distanceTraveled = distanceTraveled;
    }

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public Long getPowerUpId() {
        return powerUpId;
    }

    public void setPowerUpId(Long powerUpId) {
        this.powerUpId = powerUpId;
    }

    public Boolean getIsHighScore() {
        return isHighScore;
    }

    public void setIsHighScore(Boolean isHighScore) {
        this.isHighScore = isHighScore;
    }

    public List<PowerUpUsageDTO> getPowerUps() {
        return powerUps;
    }

    public void setPowerUps(List<PowerUpUsageDTO> powerUps) {
        this.powerUps = powerUps;
    }
}
