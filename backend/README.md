# Endless Runner Game Backend

A Spring Boot backend service for a 2D endless runner game where players control a robot that runs continuously while avoiding obstacles.

## Game Features

- Player can jump or duck to avoid various obstacles
- Random power-ups appear during gameplay:
  - Speed Boost: Makes player run faster and ignore obstacles for a few seconds
  - Double Points: Doubles the points earned during the effect
  - Coin Magnet: Attracts coins to the player
- User registration and authentication system
- Leaderboard to track high scores across all players
- Persistence of player scores and game sessions

## Technical Stack

- Java 17
- Spring Boot 3.5.0
- Spring Security with JWT authentication
- Spring Data JPA
- Neon PostgreSQL (serverless PostgreSQL database)
- RESTful API design

## Getting Started

### Prerequisites

- Java 17 or higher
- PostgreSQL database
- Gradle build tool

### Configuration

Update the database connection settings in `src/main/resources/application.properties` or set environment variables for production.

### Running the Application

```bash
# Run with development profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Run with production profile
./gradlew bootRun --args='--spring.profiles.active=prod'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Game
- `POST /api/game/score` - Submit a game score
- `GET /api/user/sessions` - Get user's game history
- `GET /api/game/top-sessions` - Get top game sessions
- `GET /api/leaderboard` - Get global leaderboard

### Power-ups
- `GET /api/powerups/list` - Get all available power-ups
- `GET /api/powerups/{id}` - Get power-up by ID
- `GET /api/powerups/name/{name}` - Get power-up by name

## Security

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Database Schema

- **users** - Stores user information and high scores
- **game_sessions** - Records of individual game sessions
- **power_ups** - Available power-up types and their effects

## License

This project is licensed under the MIT License - see the LICENSE file for details.
