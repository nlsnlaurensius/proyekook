package com.nelson.proyekoop.dto;

public class GameScoreDTO {
    private Integer score;
    private Integer coinsCollected;

    public GameScoreDTO() {
    }

    public GameScoreDTO(Integer score, Integer coinsCollected) {
        this.score = score;
        this.coinsCollected = coinsCollected;
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
}
