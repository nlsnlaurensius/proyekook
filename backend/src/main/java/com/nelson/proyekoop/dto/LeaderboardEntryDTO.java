package com.nelson.proyekoop.dto;

public class LeaderboardEntryDTO {
    private String username;
    private Integer score;
    private Integer rank;

    public LeaderboardEntryDTO() {
    }

    public LeaderboardEntryDTO(String username, Integer score, Integer rank) {
        this.username = username;
        this.score = score;
        this.rank = rank;
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

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}
