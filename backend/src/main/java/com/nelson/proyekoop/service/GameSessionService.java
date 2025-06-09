package com.nelson.proyekoop.service;

import com.nelson.proyekoop.dto.GameScoreDTO;
import com.nelson.proyekoop.dto.GameSessionDTO;
import com.nelson.proyekoop.dto.PowerUpUsageDTO;
import com.nelson.proyekoop.model.GameSession;
import com.nelson.proyekoop.model.GameSessionPowerUp;
import com.nelson.proyekoop.model.PowerUp;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.repository.GameSessionRepository;
import com.nelson.proyekoop.repository.GameSessionPowerUpRepository;
import com.nelson.proyekoop.repository.PowerUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final UserService userService;
    private final PowerUpRepository powerUpRepository;
    private final GameSessionPowerUpRepository gameSessionPowerUpRepository;

    @Autowired
    public GameSessionService(GameSessionRepository gameSessionRepository, UserService userService, PowerUpRepository powerUpRepository, GameSessionPowerUpRepository gameSessionPowerUpRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.userService = userService;
        this.powerUpRepository = powerUpRepository;
        this.gameSessionPowerUpRepository = gameSessionPowerUpRepository;
    }

    public GameSessionDTO saveGameSession(Long userId, GameScoreDTO gameScoreDTO) {
        User user = userService.getEntityById(userId);
        Integer score = gameScoreDTO.getScore();
        if (score == null && gameScoreDTO.getDistanceTraveled() != null) {
            score = gameScoreDTO.getDistanceTraveled();
        }
        if (score == null) {
            score = 0;
        }
        GameSession gameSession = new GameSession(
                user,
                score,
                gameScoreDTO.getCoinsCollected(),
                gameScoreDTO.getDistanceTraveled(),
                null // powerUp field sudah tidak dipakai
        );
        gameSession = gameSessionRepository.save(gameSession);
        // Simpan power up yang diambil
        if (gameScoreDTO.getPowerUps() != null) {
            for (PowerUpUsageDTO pu : gameScoreDTO.getPowerUps()) {
                PowerUp powerUp = powerUpRepository.findById(pu.getPowerUpId()).orElse(null);
                if (powerUp != null) {
                    GameSessionPowerUp gspu = new GameSessionPowerUp();
                    gspu.setGameSession(gameSession);
                    gspu.setPowerUp(powerUp);
                    gspu.setDuration(pu.getDuration());
                    gspu.setActivatedAt(java.time.LocalDateTime.parse(pu.getActivatedAt()));
                    gameSessionPowerUpRepository.save(gspu);
                }
            }
        }
        boolean isHighScore = false;
        if (score > user.getHighestScore()) {
            userService.updateHighScore(userId, score);
            isHighScore = true;
        }
        GameSessionDTO dto = convertToDTO(gameSession);
        dto.setIsHighScore(isHighScore);
        return dto;
    }

    public List<GameSessionDTO> getGameSessionsByUser(Long userId) {
        User user = userService.getEntityById(userId);
        List<GameSession> sessions = gameSessionRepository.findByUserOrderByScoreDesc(user);

        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameSessionDTO> getTopGameSessions() {
        List<GameSession> sessions = gameSessionRepository.findTopGameSessions();

        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private GameSessionDTO convertToDTO(GameSession gameSession) {
        GameSessionDTO dto = new GameSessionDTO();
        dto.setId(gameSession.getId());
        dto.setUserId(gameSession.getUser().getId());
        dto.setUsername(gameSession.getUser().getUsername());
        dto.setScore(gameSession.getScore());
        dto.setCoinsCollected(gameSession.getCoinsCollected());
        dto.setDistanceTraveled(gameSession.getDistanceTraveled());
        dto.setPlayedAt(gameSession.getPlayedAt());
        // Ambil semua power up yang diambil di sesi ini
        if (gameSession.getPowerUps() != null) {
            java.util.List<PowerUpUsageDTO> powerUpDTOs = new ArrayList<>();
            for (GameSessionPowerUp gspu : gameSession.getPowerUps()) {
                PowerUpUsageDTO puDTO = new PowerUpUsageDTO();
                puDTO.setPowerUpId(gspu.getPowerUp().getId());
                puDTO.setName(gspu.getPowerUp().getName());
                puDTO.setDescription(gspu.getPowerUp().getDescription());
                puDTO.setDuration(gspu.getDuration());
                puDTO.setActivatedAt(gspu.getActivatedAt().toString());
                powerUpDTOs.add(puDTO);
            }
            dto.setPowerUps(powerUpDTOs);
        }
        dto.setIsHighScore(gameSession.getScore().equals(gameSession.getUser().getHighestScore()));

        return dto;
    }
}
