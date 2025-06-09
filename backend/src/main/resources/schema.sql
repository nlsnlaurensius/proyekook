-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    highest_score INTEGER DEFAULT 0
);

-- Create power_ups table
CREATE TABLE power_ups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    duration INTEGER,
    effect_multiplier DOUBLE PRECISION,
    icon_url VARCHAR(255)
);

-- Create game_sessions table
CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    coins_collected INTEGER,
    played_at TIMESTAMP,
    distance_traveled INTEGER,
    power_up_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (power_up_id) REFERENCES power_ups(id)
);

-- Create game_session_power_ups table
CREATE TABLE game_session_power_ups (
    id SERIAL PRIMARY KEY,
    game_session_id INTEGER NOT NULL,
    power_up_id INTEGER NOT NULL,
    activated_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    FOREIGN KEY (game_session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (power_up_id) REFERENCES power_ups(id)
);

-- Create indexes for better performance
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_score ON game_sessions(score);
CREATE INDEX idx_users_highest_score ON users(highest_score);
