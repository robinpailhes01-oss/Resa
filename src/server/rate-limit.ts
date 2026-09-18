/**
 * Limitation de débit en mémoire (fenêtre glissante).
 *
 * Valeurs initiales (§13) : 5 tentatives / 15 min par IP,
 * 3 emails / heure par adresse. Configurables par variables d'environnement.
 *
 * Limite : le compteur est local à chaque instance serveur. Pour un
 * déploiement multi-instances, brancher un store partagé (Redis/Upstash)
 * derrière la même interface.
 */
export interface RateLimiter {
  /** Retourne true si la requête est admise, false si la limite est atteinte. */
  hit(key: string, now?: number): boolean;
}

export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  hit(key: string, now = Date.now()): boolean {
    const since = now - this.windowMs;
    const stamps = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (stamps.length >= this.limit) {
      this.hits.set(key, stamps);
      return false;
    }
    stamps.push(now);
    this.hits.set(key, stamps);
    if (this.hits.size > 10_000) this.sweep(since);
    return true;
  }

  private sweep(since: number): void {
    for (const [key, stamps] of this.hits) {
      const kept = stamps.filter((t) => t > since);
      if (kept.length === 0) this.hits.delete(key);
      else this.hits.set(key, kept);
    }
  }
}

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

const globalLimiters = globalThis as unknown as { __resoRateLimiters?: { ip: RateLimiter; confirm: RateLimiter } };

export function getRateLimiters(): { ip: RateLimiter; confirm: RateLimiter } {
  if (!globalLimiters.__resoRateLimiters) {
    globalLimiters.__resoRateLimiters = {
      ip: new SlidingWindowRateLimiter(envInt("RATE_LIMIT_IP_MAX", 5), envInt("RATE_LIMIT_IP_WINDOW_MIN", 15) * 60_000),
      confirm: new SlidingWindowRateLimiter(envInt("RATE_LIMIT_CONFIRM_MAX", 20), 15 * 60_000),
    };
  }
  return globalLimiters.__resoRateLimiters;
}
