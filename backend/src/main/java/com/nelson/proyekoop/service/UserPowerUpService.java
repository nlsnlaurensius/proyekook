package com.nelson.proyekoop.service;

import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.model.PowerUp;
import com.nelson.proyekoop.model.UserPowerUp;
import com.nelson.proyekoop.repository.PowerUpRepository;
import com.nelson.proyekoop.repository.UserPowerUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserPowerUpService {
    private final UserPowerUpRepository userPowerUpRepository;
    private final PowerUpRepository powerUpRepository;

    @Autowired
    public UserPowerUpService(UserPowerUpRepository userPowerUpRepository, PowerUpRepository powerUpRepository) {
        this.userPowerUpRepository = userPowerUpRepository;
        this.powerUpRepository = powerUpRepository;
    }

    public List<UserPowerUp> getUserPowerUps(Long userId) {
        return userPowerUpRepository.findByUserId(userId);
    }

    @Transactional
    public void addOrIncrementUserPowerUp(User user, PowerUp powerUp) {
        List<UserPowerUp> list = userPowerUpRepository.findByUserId(user.getId());
        UserPowerUp found = null;
        for (UserPowerUp up : list) {
            if (up.getPowerUp().getId().equals(powerUp.getId())) {
                found = up;
                break;
            }
        }
        if (found != null) {
            found.setQuantity(found.getQuantity() + 1);
            userPowerUpRepository.save(found);
        } else {
            UserPowerUp newUp = new UserPowerUp(user, powerUp, 1);
            userPowerUpRepository.save(newUp);
        }
    }

    @Transactional
    public void decrementUserPowerUp(User user, PowerUp powerUp) {
        List<UserPowerUp> list = userPowerUpRepository.findByUserId(user.getId());
        for (UserPowerUp up : list) {
            if (up.getPowerUp().getId().equals(powerUp.getId()) && up.getQuantity() > 0) {
                up.setQuantity(up.getQuantity() - 1);
                userPowerUpRepository.save(up);
                break;
            }
        }
    }
}
