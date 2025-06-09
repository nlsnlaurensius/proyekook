package com.nelson.proyekoop.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_session_power_ups")
public class GameSessionPowerUp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "power_up_id", nullable = false)
    private PowerUp powerUp;

    @Column(name = "activated_at", nullable = false)
    private LocalDateTime activatedAt;

    @Column(name = "duration", nullable = false)
    private Integer duration; // in seconds

    public GameSessionPowerUp() {}

    public GameSessionPowerUp(GameSession gameSession, PowerUp powerUp, LocalDateTime activatedAt, Integer duration) {
        this.gameSession = gameSession;
        this.powerUp = powerUp;
        this.activatedAt = activatedAt;
        this.duration = duration;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public GameSession getGameSession() { return gameSession; }
    public void setGameSession(GameSession gameSession) { this.gameSession = gameSession; }
    public PowerUp getPowerUp() { return powerUp; }
    public void setPowerUp(PowerUp powerUp) { this.powerUp = powerUp; }
    public LocalDateTime getActivatedAt() { return activatedAt; }
    public void setActivatedAt(LocalDateTime activatedAt) { this.activatedAt = activatedAt; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
}
