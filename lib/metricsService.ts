// lib/metricsService.ts

/**
 * Calculates speed in km/h.
 * Formula: (distance_m / time_s) * 3.6
 * Example: calculateSpeed(60, 6.8) → 31.76
 */
export function calculateSpeed(distanceM: number, timeS: number): number {
  return (distanceM / timeS) * 3.6
}

/**
 * Calculates pace in min/km.
 * Only meaningful for distances >= 800m.
 * Formula: (time_s / 60) / (distance_m / 1000)
 * Example: calculatePace(1500, 210.0) → 2.33
 * For distances < 800m, returns null.
 */
export function calculatePace(distanceM: number, timeS: number): number | null {
  if (distanceM < 800) return null
  return (timeS / 60) / (distanceM / 1000)
}

/**
 * Calculates delta PB in %.
 * Negative means improvement.
 * Formula: ((new_time - best_time) / best_time) * 100
 * Example: calculateDeltaPB(105.32, 106.5) → -1.11
 */
export function calculateDeltaPB(newTime: number, bestTime: number | null): number | null {
  if (bestTime === null) return null
  return ((newTime - bestTime) / bestTime) * 100
}

/**
 * Calculates goal progress in %.
 * Formula: ((baseline - current) / (baseline - target)) * 100
 * Clamped between 0% and 100%.
 * Example: calculateGoalProgress(120, 112, 100) → 40
 */
export function calculateGoalProgress(baseline: number, current: number, target: number): number {
  const progress = ((baseline - current) / (baseline - target)) * 100
  return Math.max(0, Math.min(100, progress))
}