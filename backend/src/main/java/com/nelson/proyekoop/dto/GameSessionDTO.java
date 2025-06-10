package com.nelson.proyekoop.dto;

import java.time.LocalDateTime;

public class GameSessionDTO {
    private Long id;
    private Long userId;
    private String username;
    private Integer score;
    private Integer coinsCollected;
    private LocalDateTime playedAt;
    private Boolean isHighScore;

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

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public Boolean getIsHighScore() {
        return isHighScore;
    }

    public void setIsHighScore(Boolean isHighScore) {
        this.isHighScore = isHighScore;
    }
}
