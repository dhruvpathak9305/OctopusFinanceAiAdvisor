/**
 * Robust date parsing utilities for display-formatted dates like
 * "02 Apr 2025" or "28 Dec 2024" that can be unreliable with new Date()
 * across RN platforms.
 */

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/**
 * Parse a display date string like "02 Apr 2025" into a Date (local time).
 * Falls back to native Date parser and finally epoch if invalid.
 */
export function parseDisplayDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parts = dateStr.trim().replace(/\s+/g, " ").split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monKey = parts[1].toLowerCase();
    const month = MONTHS[monKey] ?? MONTHS[monKey.slice(0, 3)];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date(0);
}

/**
 * Split a trip `dates` string like "02 Apr 2025 - 03 Apr 2025" into start/end Date objects.
 */
export function splitTripDates(dates: string): { start: Date; end: Date } {
  const [startStr, endStr] = (dates || "").split(" - ");
  return { start: parseDisplayDate(startStr), end: parseDisplayDate(endStr) };
}
