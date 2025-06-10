package com.nelson.proyekoop.dto;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String password;
    private Integer highestScore;
    private Integer coin;

    public UserDTO() {
    }

    public UserDTO(Long id, String username, String email, Integer highestScore, Integer coin) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.highestScore = highestScore;
        this.coin = coin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(Integer highestScore) {
        this.highestScore = highestScore;
    }

    public Integer getCoin() {
        return coin;
    }

    public void setCoin(Integer coin) {
        this.coin = coin;
    }
}
