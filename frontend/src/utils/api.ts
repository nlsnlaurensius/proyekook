const BASE_URL = 'https://neon-runner-nelson.osc-fr1.scalingo.io/api';

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  if (data.payload) {
    const payload = data.payload;
    return {
      token: payload.token,
      user: {
        id: payload.id ?? null,
        username: payload.username ?? username,
        highScore: payload.highestScore ?? 0,
        email: payload.email ?? ''
      }
    };
  }
  if (data.token && data.user) return data;
  return data;
}

export async function getLeaderboard(token?: string) {
  const res = await fetch(`${BASE_URL}/users/leaderboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getUserByUsername(username: string, token?: string) {
  const res = await fetch(`${BASE_URL}/users/username/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function submitGameSession(userId: number, data: any, token: string) {
  const res = await fetch(`${BASE_URL}/game-sessions/user/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit game session');
  return res.json();
}

export async function getUserSessions(userId: number, token: string) {
  const res = await fetch(`${BASE_URL}/game-sessions/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function getPowerUps(token?: string) {
  const res = await fetch(`${BASE_URL}/powerups/list`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch powerups');
  return res.json();
}

export async function buyPowerUp(userId: number, powerUpId: number, token?: string) {
  const res = await fetch(`${BASE_URL}/powerups/buy/${userId}/${powerUpId}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || 'Gagal membeli power up');
  return data;
}

export async function getUserOwnedPowerUps(userId: number, token?: string) {
  const res = await fetch(`${BASE_URL}/powerups/owned/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch user owned powerups');
  return res.json();
}

export async function usePowerUp(userId: number, powerUpId: number, token?: string) {
  const res = await fetch(`${BASE_URL}/powerups/use/${userId}/${powerUpId}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || 'Gagal menggunakan power up');
  return data;
}
