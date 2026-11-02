import { describe, expect, it } from 'vitest';
import { advanceSplatter, createSplatter, zombieAt } from './combat';
import { seededRandom } from './world';

describe('zombieAt', () => {
  const zombie = { id: 'visitor-1', x: 100, y: 100 };

  it('hits a zombie from its head to its feet', () => {
    expect(zombieAt({ x: 100, y: 75 }, [zombie])).toBe(zombie);
    expect(zombieAt({ x: 100, y: 100 }, [zombie])).toBe(zombie);
  });

  it('misses empty ground and removed zombies', () => {
    expect(zombieAt({ x: 109, y: 90 }, [zombie])).toBeUndefined();
    expect(zombieAt({ x: 100, y: 73 }, [zombie])).toBeUndefined();
    expect(zombieAt({ x: 100, y: 103 }, [zombie])).toBeUndefined();
    expect(zombieAt({ x: 100, y: 90 }, [])).toBeUndefined();
  });

  it('selects the frontmost overlapping zombie without reordering targets', () => {
    const front = { id: 'vendor-1', x: 100, y: 105 };
    const targets = [zombie, front];
    expect(zombieAt({ x: 100, y: 90 }, targets)).toBe(front);
    expect(targets).toEqual([zombie, front]);
  });
});

describe('splatter', () => {
  it('creates a large, finite burst at the target', () => {
    const particles = createSplatter({ x: 50, y: 80 }, seededRandom(42));
    expect(particles).toHaveLength(64);
    for (const particle of particles) {
      expect(particle.x).toBe(50);
      expect(particle.y).toBe(66);
      expect(particle.size).toBeGreaterThan(0);
      expect(particle.lifetime).toBeGreaterThanOrEqual(3);
      expect(Object.values(particle).every(Number.isFinite)).toBe(true);
    }
  });

  it('moves particles, settles them on the ground, and expires them', () => {
    const original = createSplatter({ x: 50, y: 80 }, seededRandom(42));
    let particles = advanceSplatter(original, 0.05);
    expect(particles[0].y).toBeLessThan(original[0].y);
    expect(original[0].age).toBe(0);
    for (let i = 0; i < 50; i++) particles = advanceSplatter(particles, 0.05);
    expect(particles.length).toBeGreaterThan(0);
    for (const particle of particles) {
      expect(particle.y).toBe(particle.floor);
      expect(particle.vy).toBe(0);
    }
    for (let i = 0; i < 80; i++) particles = advanceSplatter(particles, 0.05);
    expect(particles).toEqual([]);
  });
});
