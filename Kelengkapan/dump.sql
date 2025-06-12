CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  highest_score INTEGER DEFAULT 0,
  coin INTEGER DEFAULT 0
);

CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  score INTEGER NOT NULL,
  coins_collected INTEGER DEFAULT 0,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE power_ups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(32) UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER,
  effect_multiplier DOUBLE PRECISION,
  price INTEGER NOT NULL
);

CREATE TABLE user_power_ups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  power_up_id INTEGER REFERENCES power_ups(id),
  quantity INTEGER DEFAULT 0,
  UNIQUE(user_id, power_up_id)
);