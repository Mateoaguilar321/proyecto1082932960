// lib/timeUtils.ts

/**
 * Parses a time string in "mm:ss.ms" or "ss.ms" format to seconds (decimal).
 * Examples:
 * - "1:45.32" → 105.32
 * - "9.58" → 9.58
 */
export function parseTime(input: string): number {
  const trimmed = input.trim()
  if (trimmed.includes(':')) {
    // Format: mm:ss.ms
    const [minutes, seconds] = trimmed.split(':')
    return parseFloat(minutes) * 60 + parseFloat(seconds)
  } else {
    // Format: ss.ms
    return parseFloat(trimmed)
  }
}

/**
 * Formats seconds (decimal) to "mm:ss.ms" or "ss.ms" format.
 * Examples:
 * - 105.32 → "1:45.32"
 * - 9.58 → "9.58"
 */
export function formatTime(seconds: number): string {
  const totalSeconds = Math.floor(seconds)
  const milliseconds = Math.round((seconds - totalSeconds) * 100)

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  } else {
    return `${totalSeconds}.${milliseconds.toString().padStart(2, '0')}`
  }
}

/**
 * Formats long times (e.g., for marathon) as "h:mm:ss.ms"
 */
export function formatTimeLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 100)
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

// Inline tests
console.log('Testing parseTime:')
console.log(`parseTime("1:45.32") = ${parseTime("1:45.32")} (expected: 105.32)`)
console.log(`parseTime("9.58") = ${parseTime("9.58")} (expected: 9.58)`)

console.log('\nTesting formatTime:')
console.log(`formatTime(105.32) = "${formatTime(105.32)}" (expected: "1:45.32")`)
console.log(`formatTime(9.58) = "${formatTime(9.58)}" (expected: "9.58")`)