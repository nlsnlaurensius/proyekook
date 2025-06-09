package com.nelson.proyekoop.dto;

import java.util.List;

public class GameScoreDTO {
    private Integer score;
    private Integer coinsCollected;
    private Integer distanceTraveled;
    private List<PowerUpUsageDTO> powerUps; // List power up yang diambil

    public GameScoreDTO() {
    }

    public GameScoreDTO(Integer score, Integer coinsCollected, Integer distanceTraveled, List<PowerUpUsageDTO> powerUps) {
        this.score = score;
        this.coinsCollected = coinsCollected;
        this.distanceTraveled = distanceTraveled;
        this.powerUps = powerUps;
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

    public List<PowerUpUsageDTO> getPowerUps() {
        return powerUps;
    }

    public void setPowerUps(List<PowerUpUsageDTO> powerUps) {
        this.powerUps = powerUps;
    }
}
