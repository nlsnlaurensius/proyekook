package com.nelson.proyekoop.repository;

import com.nelson.proyekoop.model.PowerUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PowerUpRepository extends JpaRepository<PowerUp, Long> {
}
