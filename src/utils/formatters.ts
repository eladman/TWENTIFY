/**
 * Format weight with unit conversion
 */
export function formatWeight(kg: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') {
    const lbs = Math.round(kg * 2.20462);
    return `${lbs} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format seconds into MM:SS or H:MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Format distance in meters to km or miles
 */
export function formatDistance(meters: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') {
    const miles = meters / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Format a number with commas (e.g. 4230 → "4,230")
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}
