import { format } from 'date-fns';
import type { Units } from '@/types/user';
import type { ExerciseEquipment } from '@/types/workout';

/**
 * Format a duration in seconds to a human-readable string.
 * < 60 → "45s", < 3600 → "2:00", ≥ 3600 → "1:02:15"
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (seconds < 60) {
    return `${s}s`;
  }
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

/**
 * Format weight with unit conversion.
 * Imperial rounds to nearest 0.5 lbs.
 */
export function formatWeight(kg: number, units: Units): string {
  if (units === 'imperial') {
    const lbs = Math.round(kg * 2.205 * 2) / 2;
    return `${lbs} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format distance in meters.
 * Metric: < 1000 → "850 m", ≥ 1000 → "4.2 km"
 * Imperial: always miles
 */
export function formatDistance(meters: number, units: Units): string {
  if (units === 'imperial') {
    const miles = meters / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Format pace from seconds/km.
 * Metric: "6:12 /km", Imperial: "9:58 /mi"
 */
export function formatPace(secondsPerKm: number, units: Units): string {
  const secPerUnit = units === 'imperial' ? secondsPerKm * 1.60934 : secondsPerKm;
  const m = Math.floor(secPerUnit / 60);
  const s = Math.round(secPerUnit % 60);
  const suffix = units === 'imperial' ? '/mi' : '/km';
  return `${m}:${s.toString().padStart(2, '0')} ${suffix}`;
}

/**
 * Format a rep range. "8 reps" or "6-8 reps"
 */
export function formatReps(min: number, max: number): string {
  if (min === max) {
    return `${min} reps`;
  }
  return `${min}-${max} reps`;
}

/**
 * Format total volume with comma separators.
 * Metric: "4,230 kg", Imperial: "9,326 lbs"
 */
export function formatVolume(totalKg: number, units: Units): string {
  if (units === 'imperial') {
    const lbs = Math.round(totalKg * 2.205);
    return `${lbs.toLocaleString('en-US')} lbs`;
  }
  return `${Math.round(totalKg).toLocaleString('en-US')} kg`;
}

/**
 * Format a date as "Tue, Feb 21"
 */
export function formatDate(date: Date): string {
  return format(date, 'EEE, MMM d');
}

/**
 * Format time of day as "7:30 AM"
 */
export function formatTimeOfDay(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Format a number with commas (e.g. 4230 → "4,230")
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Convert stored kg to display units.
 * Imperial: rounds to nearest 0.5 lbs.
 */
export function kgToDisplayWeight(kg: number, units: Units): number {
  if (units === 'imperial') {
    return Math.round(kg * 2.205 * 2) / 2;
  }
  return kg;
}

/**
 * Convert display weight back to kg for storage.
 */
export function displayWeightToKg(displayValue: number, units: Units): number {
  if (units === 'imperial') {
    return Math.round((displayValue / 2.205) * 10) / 10;
  }
  return displayValue;
}

/**
 * Step size for weight +/- buttons based on equipment and unit system.
 */
export function getWeightStep(
  equipment: ExerciseEquipment,
  isLowerBody: boolean,
  units: Units,
): number {
  if (equipment === 'bodyweight') return 0;
  if (units === 'imperial') return 5;
  switch (equipment) {
    case 'barbell':
      return isLowerBody ? 5 : 2.5;
    case 'dumbbell':
    case 'cable':
    case 'machine':
      return 2;
  }
}

/**
 * Returns the unit label string.
 */
export function getUnitLabel(units: Units): string {
  return units === 'imperial' ? 'lbs' : 'kg';
}
