package com.nelson.proyekoop.controller;

import com.nelson.proyekoop.dto.ApiResponse;
import com.nelson.proyekoop.dto.GameScoreDTO;
import com.nelson.proyekoop.dto.GameSessionDTO;
import com.nelson.proyekoop.dto.UserDTO;
import com.nelson.proyekoop.service.GameSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game-sessions")
public class GameSessionController {

    private final GameSessionService gameSessionService;

    @Autowired
    public GameSessionController(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<UserDTO>> saveGameSession(
            @PathVariable Long userId,
            @RequestBody GameScoreDTO gameScoreDTO) {
        GameSessionDTO savedSession = gameSessionService.saveGameSession(userId, gameScoreDTO);
        // Ambil user terbaru setelah coin diupdate
        UserDTO userDTO = gameSessionService.getUserService().getUserById(userId);
        ApiResponse<UserDTO> response = new ApiResponse<>(true, "Game session saved successfully", userDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<GameSessionDTO>>> getGameSessionsByUser(@PathVariable Long userId) {
        List<GameSessionDTO> sessions = gameSessionService.getGameSessionsByUser(userId);
        ApiResponse<List<GameSessionDTO>> response = new ApiResponse<>(true, "Game sessions fetched successfully", sessions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<GameSessionDTO>>> getTopGameSessions() {
        List<GameSessionDTO> topSessions = gameSessionService.getTopGameSessions();
        ApiResponse<List<GameSessionDTO>> response = new ApiResponse<>(true, "Top game sessions fetched successfully", topSessions);
        return ResponseEntity.ok(response);
    }
}
