/**
 * Rate Limiter en memoria para limitar intentos de inicio de sesión por IP.
 * Límite: 5 intentos por minuto (60.000 ms).
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const loginAttemptsMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minuto

/**
 * Limpia registros expirados periódicamente para evitar fugas de memoria
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  loginAttemptsMap.forEach((record, ip) => {
    if (now > record.resetAt) {
      loginAttemptsMap.delete(ip);
    }
  });
}

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  cleanupExpiredRecords();

  const now = Date.now();
  const record = loginAttemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    // Primer intento en la ventana de tiempo
    loginAttemptsMap.set(ip, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - 1,
      retryAfterSeconds: 0,
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    // Límite excedido
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  // Incrementar intento
  record.attempts += 1;
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Resetea el contador de intentos tras un login exitoso
 */
export function resetLoginRateLimit(ip: string) {
  loginAttemptsMap.delete(ip);
}
