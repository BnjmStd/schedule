/**
 * ⏰ Time helpers — bridge between Prisma @db.Time (Date) and app strings ("HH:mm")
 *
 * PostgreSQL TIME columns are returned by Prisma as Date objects where only
 * the UTC time portion is meaningful (date part is always epoch 1970-01-01).
 * These helpers convert at the DB boundary so the rest of the app keeps using
 * plain "HH:mm" strings.
 */

/**
 * Converts an "HH:mm" string to a Date object for @db.Time Prisma fields.
 *
 * @example  timeStringToDate("08:00")  // → Date(1970-01-01T08:00:00.000Z)
 */
export function timeStringToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(0); // epoch — date portion is irrelevant for TIME columns
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Converts a Prisma @db.Time Date object back to an "HH:mm" string.
 *
 * @example  dateToTimeString(new Date("1970-01-01T08:00:00.000Z"))  // → "08:00"
 */
export function dateToTimeString(date: Date): string {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
