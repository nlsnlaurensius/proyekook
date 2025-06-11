package com.nelson.proyekoop.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "user_power_ups",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "power_up_id"})
)
public class UserPowerUp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "power_up_id", nullable = false)
    private PowerUp powerUp;

    @Column(nullable = false)
    private Integer quantity = 0;

    public UserPowerUp() {}

    public UserPowerUp(User user, PowerUp powerUp, Integer quantity) {
        this.user = user;
        this.powerUp = powerUp;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public PowerUp getPowerUp() { return powerUp; }
    public void setPowerUp(PowerUp powerUp) { this.powerUp = powerUp; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
