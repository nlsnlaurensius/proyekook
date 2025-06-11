package com.nelson.proyekoop.service;

import com.nelson.proyekoop.dto.UserDTO;
import com.nelson.proyekoop.model.User;
import com.nelson.proyekoop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public List<UserDTO> getLeaderboard() {
        // Ambil 10 user dengan skor tertinggi
        return userRepository.findTopUsersByHighestScore().stream()
                .limit(10)
                .map(this::convertToDTO)
                .toList();
    }

    public User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getHighestScore(),
                user.getCoin()
        );
    }
}
