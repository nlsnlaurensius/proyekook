package com.nelson.proyekoop.service;

import com.nelson.proyekoop.dto.LeaderboardEntryDTO;
import com.nelson.proyekoop.dto.UserDTO;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO registerUser(String username, String password, String email) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User(username, passwordEncoder.encode(password), email);
        user = userRepository.save(user);

        return convertToDTO(user);
    }

    public UserDTO getUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return convertToDTO(userOptional.get());
        }
        throw new RuntimeException("User not found with id: " + id);
    }

    public UserDTO getUserByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            return convertToDTO(userOptional.get());
        }
        throw new RuntimeException("User not found with username: " + username);
    }

    public List<LeaderboardEntryDTO> getLeaderboard() {
        List<User> topUsers = userRepository.findTopUsersByHighestScore();
        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();

        for (int i = 0; i < topUsers.size(); i++) {
            User user = topUsers.get(i);
            leaderboard.add(new LeaderboardEntryDTO(
                    user.getUsername(),
                    user.getHighestScore(),
                    i + 1
            ));
        }

        return leaderboard;
    }

    public UserDTO updateHighScore(Long userId, Integer score) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (score > user.getHighestScore()) {
                user.setHighestScore(score);
                user = userRepository.save(user);
            }
            return convertToDTO(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getHighestScore()
        );
    }
}
