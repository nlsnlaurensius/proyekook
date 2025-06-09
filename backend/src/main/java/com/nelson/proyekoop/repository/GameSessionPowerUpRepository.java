package com.nelson.proyekoop.repository;

import com.nelson.proyekoop.model.GameSessionPowerUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameSessionPowerUpRepository extends JpaRepository<GameSessionPowerUp, Long> {
    // Custom query methods if needed
}
