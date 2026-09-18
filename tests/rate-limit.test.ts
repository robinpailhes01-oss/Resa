import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";

describe("SlidingWindowRateLimiter", () => {
  it("admet 5 tentatives puis bloque dans la fenêtre", () => {
    const limiter = new SlidingWindowRateLimiter(5, 15 * 60_000);
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i += 1) expect(limiter.hit("ip", t0 + i)).toBe(true);
    expect(limiter.hit("ip", t0 + 10)).toBe(false);
    expect(limiter.hit("autre-ip", t0 + 10)).toBe(true);
  });

  it("libère après la fenêtre", () => {
    const limiter = new SlidingWindowRateLimiter(1, 1000);
    expect(limiter.hit("ip", 0)).toBe(true);
    expect(limiter.hit("ip", 500)).toBe(false);
    expect(limiter.hit("ip", 1500)).toBe(true);
  });
});
