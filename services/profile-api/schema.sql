CREATE TABLE IF NOT EXISTS profiles (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS oauth_pending (state TEXT PRIMARY KEY, challenge TEXT NOT NULL, user_id TEXT, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS pending_expiry ON oauth_pending(expires_at);
