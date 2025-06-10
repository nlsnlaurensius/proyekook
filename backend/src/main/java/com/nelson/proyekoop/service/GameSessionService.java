package com.nelson.proyekoop.service;

import com.nelson.proyekoop.dto.GameScoreDTO;
import com.nelson.proyekoop.dto.GameSessionDTO;
import com.nelson.proyekoop.model.GameSession;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.repository.GameSessionRepository;
import com.nelson.proyekoop.repository.PowerUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameSessionService {
    private static final Logger logger = LoggerFactory.getLogger(GameSessionService.class);
    private final GameSessionRepository gameSessionRepository;
    private final UserService userService;
    private final PowerUpRepository powerUpRepository;

    @Autowired
    public GameSessionService(GameSessionRepository gameSessionRepository, UserService userService, PowerUpRepository powerUpRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.userService = userService;
        this.powerUpRepository = powerUpRepository;
    }

    public GameSessionDTO saveGameSession(Long userId, GameScoreDTO gameScoreDTO) {
        logger.info("[GameSession] Mulai simpan session: userId={}, score={}, coinsCollected={}", userId, gameScoreDTO.getScore(), gameScoreDTO.getCoinsCollected());
        User user = userService.getEntityById(userId);
        Integer score = gameScoreDTO.getScore();
        // Hapus fallback distanceTraveled
        if (score == null) {
            score = 0;
        }
        int coinsCollected = gameScoreDTO.getCoinsCollected() != null ? gameScoreDTO.getCoinsCollected() : 0;
        GameSession gameSession = new GameSession(
                user,
                score,
                coinsCollected
        );
        logger.info("[GameSession] Sebelum save: {}", gameSession);
        gameSession = gameSessionRepository.save(gameSession);
        logger.info("[GameSession] Sesudah save: id={}, userId={}, score={}, coinsCollected={}", gameSession.getId(), userId, score, coinsCollected);
        // Tambahkan coin ke user
        user.setCoin((user.getCoin() != null ? user.getCoin() : 0) + coinsCollected);
        userService.saveUser(user);
        boolean isHighScore = false;
        if (score > user.getHighestScore()) {
            userService.updateHighScore(userId, score);
            isHighScore = true;
        }
        GameSessionDTO dto = convertToDTO(gameSession);
        // Hapus setDistanceTraveled
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
        dto.setPlayedAt(gameSession.getPlayedAt());
        dto.setIsHighScore(gameSession.getScore().equals(gameSession.getUser().getHighestScore()));
        return dto;
    }

    public UserService getUserService() {
        return userService;
    }
}
