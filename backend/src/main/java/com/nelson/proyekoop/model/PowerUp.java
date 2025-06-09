package com.nelson.proyekoop.model;

import jakarta.persistence.*;

@Entity
@Table(name = "power_ups")
public class PowerUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @Column
    private Integer duration; // in seconds

    @Column(name = "effect_multiplier")
    private Double effectMultiplier;

    @Column(name = "icon_url")
    private String iconUrl;

    public PowerUp() {
    }

    public PowerUp(String name, String description, Integer duration, Double effectMultiplier, String iconUrl) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.effectMultiplier = effectMultiplier;
        this.iconUrl = iconUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Double getEffectMultiplier() {
        return effectMultiplier;
    }

    public void setEffectMultiplier(Double effectMultiplier) {
        this.effectMultiplier = effectMultiplier;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }
}
