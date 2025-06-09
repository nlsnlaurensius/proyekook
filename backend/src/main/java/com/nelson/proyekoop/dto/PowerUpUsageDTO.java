package com.nelson.proyekoop.dto;

public class PowerUpUsageDTO {
    private Long powerUpId;
    private String name;
    private String description;
    private Integer duration; // in seconds
    private String activatedAt; // ISO string, frontend kirim waktu aktif

    public PowerUpUsageDTO() {}

    public Long getPowerUpId() { return powerUpId; }
    public void setPowerUpId(Long powerUpId) { this.powerUpId = powerUpId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public String getActivatedAt() { return activatedAt; }
    public void setActivatedAt(String activatedAt) { this.activatedAt = activatedAt; }
}
