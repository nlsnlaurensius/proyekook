package com.nelson.proyekoop.repository;

import com.nelson.proyekoop.model.UserPowerUp;
import com.nelson.proyekoop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserPowerUpRepository extends JpaRepository<UserPowerUp, Long> {
    List<UserPowerUp> findByUserId(Long userId);
}
