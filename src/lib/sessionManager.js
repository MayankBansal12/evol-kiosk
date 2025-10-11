/**
 * Session Manager for Kiosk Conversation Persistence
 * Handles localStorage operations for multi-user kiosk environment
 */

const SESSION_PREFIX = "kiosk-session-";
const CURRENT_SESSION_KEY = "currentKioskSession";
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate unique session ID
 */
export function generateSessionId() {
  return `${SESSION_PREFIX}${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

/**
 * Get current session ID
 */
export function getCurrentSessionId() {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error("Error reading current session:", error);
    return null;
  }
}

/**
 * Set current session ID
 */
export function setCurrentSessionId(sessionId) {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    return true;
  } catch (error) {
    console.error("Error setting current session:", error);
    return false;
  }
}

/**
 * Save session data
 */
export function saveSessionData(sessionId, data) {
  try {
    const sessionData = {
      ...data,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };
    localStorage.setItem(sessionId, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error("Error saving session data:", error);
    // If quota exceeded, try to clear old sessions
    if (error.name === "QuotaExceededError") {
      clearOldSessions();
      try {
        const sessionData = {
          ...data,
          timestamp: Date.now(),
          lastActivity: Date.now(),
        };
        localStorage.setItem(sessionId, JSON.stringify(sessionData));
        return true;
      } catch (retryError) {
        console.error("Error saving session after cleanup:", retryError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Get session data
 */
export function getSessionData(sessionId) {
  try {
    const data = localStorage.getItem(sessionId);
    if (!data) return null;

    const sessionData = JSON.parse(data);

    // Check if session has expired
    const now = Date.now();
    const timeSinceLastActivity =
      now - (sessionData.lastActivity || sessionData.timestamp);

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Session expired, clear it
      clearSession(sessionId);
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Error reading session data:", error);
    return null;
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(sessionId) {
  try {
    const data = getSessionData(sessionId);
    if (data) {
      data.lastActivity = Date.now();
      localStorage.setItem(sessionId, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error updating last activity:", error);
  }
}

/**
 * Clear specific session
 */
export function clearSession(sessionId) {
  try {
    localStorage.removeItem(sessionId);
    const currentSession = getCurrentSessionId();
    if (currentSession === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
    return true;
  } catch (error) {
    console.error("Error clearing session:", error);
    return false;
  }
}

/**
 * Clear current session
 */
export function clearCurrentSession() {
  const sessionId = getCurrentSessionId();
  if (sessionId) {
    clearSession(sessionId);
  }
}

/**
 * Clear all sessions (useful for testing/debugging)
 */
export function clearAllSessions() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(SESSION_PREFIX) || key === CURRENT_SESSION_KEY) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error("Error clearing all sessions:", error);
    return false;
  }
}

/**
 * Clear old/expired sessions to free up space
 */
export function clearOldSessions() {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(SESSION_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const timeSinceLastActivity =
            now - (data.lastActivity || data.timestamp);

          // Remove sessions older than timeout
          if (timeSinceLastActivity > SESSION_TIMEOUT) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // If we can't parse it, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error("Error clearing old sessions:", error);
  }
}

/**
 * Get time remaining until session expires
 */
export function getTimeUntilExpiry(sessionId) {
  const data = getSessionData(sessionId);
  if (!data) return 0;

  const now = Date.now();
  const timeSinceLastActivity = now - (data.lastActivity || data.timestamp);
  const timeRemaining = SESSION_TIMEOUT - timeSinceLastActivity;

  return Math.max(0, timeRemaining);
}

/**
 * Check if session is about to expire (within 30 seconds)
 */
export function isSessionAboutToExpire(sessionId) {
  const timeRemaining = getTimeUntilExpiry(sessionId);
  return timeRemaining > 0 && timeRemaining <= 30000; // 30 seconds
}

/**
 * Initialize or restore session
 */
export function initSession() {
  // Clear old sessions on init
  clearOldSessions();

  // Check for existing session
  const currentSessionId = getCurrentSessionId();
  if (currentSessionId) {
    const data = getSessionData(currentSessionId);
    if (data) {
      // Valid session exists, return it
      return { sessionId: currentSessionId, data, isRestored: true };
    }
  }

  // Create new session
  const newSessionId = generateSessionId();
  setCurrentSessionId(newSessionId);
  return { sessionId: newSessionId, data: null, isRestored: false };
}
