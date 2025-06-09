package com.nelson.proyekoop.repository;

import com.nelson.proyekoop.model.GameSession;
import com.nelson.proyekoop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    List<GameSession> findByUserOrderByScoreDesc(User user);

    @Query("SELECT g FROM GameSession g ORDER BY g.score DESC")
    List<GameSession> findTopGameSessions();

    @Query("SELECT g FROM GameSession g WHERE g.user = ?1 ORDER BY g.score DESC")
    List<GameSession> findTopGameSessionsByUser(User user);
}
