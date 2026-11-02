import type { Point } from './world';

export interface ZombieTarget extends Point {
  id: string;
}

export interface Splatter extends Point {
  vx: number;
  vy: number;
  floor: number;
  age: number;
  lifetime: number;
  size: number;
}

export const SHOT_COOLDOWN = 0.3;
export const MAX_SPLATTER = 640;

/** Targets use projected world pixels, like the midway renderer. */
export function zombieAt(point: Point, targets: readonly ZombieTarget[]): ZombieTarget | undefined {
  return targets
    .filter(
      (target) =>
        Math.abs(point.x - target.x) <= 8 && point.y >= target.y - 26 && point.y <= target.y + 2,
    )
    .sort((a, b) => b.y - a.y)[0];
}

export function createSplatter(target: Point, random: () => number): Splatter[] {
  return Array.from({ length: 64 }, () => ({
    x: target.x,
    y: target.y - 14,
    vx: (random() - 0.5) * 150,
    vy: -25 - random() * 100,
    floor: target.y + (random() - 0.5) * 18,
    age: 0,
    lifetime: 3 + random() * 3,
    size: 0.8 + random() * 2.2,
  }));
}

export function advanceSplatter(particles: readonly Splatter[], dt: number): Splatter[] {
  return particles
    .map((particle) => {
      const age = particle.age + dt;
      const vy = particle.vy + 230 * dt;
      const landed = particle.y + vy * dt >= particle.floor;
      return {
        ...particle,
        x: particle.x + particle.vx * dt,
        y: landed ? particle.floor : particle.y + vy * dt,
        vx: landed ? particle.vx * Math.exp(-dt * 12) : particle.vx,
        vy: landed ? 0 : vy,
        age,
      };
    })
    .filter((particle) => particle.age < particle.lifetime);
}
