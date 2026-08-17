// Week math for the meal plan. Weeks start on Monday (foundation.md) and
// are identified by their start date as a local 'YYYY-MM-DD' key – the same
// value stored in meal_plans.week_start_date. All math is done in local
// time; the plan is a family calendar, not a timezone puzzle.
import { locale } from "@/lib/i18n";

// ⚠️ DANISH WRITES WEEKDAYS IN LOWER CASE – "mandag", not "Mandag" – and it is
// not a style choice there the way capitalising is in English. It reads
// correctly both standing alone in a row and inside a sentence ("Tilføj til
// mandag"), which is every place these are used.
//
// The short labels stay upper case in both languages: that is the design's
// treatment of the day cell, not a fact about the language.
const DAY_NAMES_EN = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_NAMES_DA = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
];

const DAY_LABELS_EN = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS_DA = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];

// Picked once at module load. `locale` cannot change while the app runs – iOS
// restarts it when the phone's language changes – so these stay plain arrays
// and every call site keeps indexing them by weekday.
export const DAY_NAMES = locale === "da" ? DAY_NAMES_DA : DAY_NAMES_EN;
export const DAY_LABELS = locale === "da" ? DAY_LABELS_DA : DAY_LABELS_EN;


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** The Monday of the week containing the given date, as a date key. */
export function weekStartOf(date: Date): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 = Sunday
  const sinceMonday = (day + 6) % 7;
  copy.setDate(copy.getDate() - sinceMonday);
  return toDateKey(copy);
}

export function addDaysKey(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function addWeeksKey(key: string, weeks: number): string {
  return addDaysKey(key, weeks * 7);
}

/** The seven date keys of a week, Monday first. */
export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i));
}

/** ISO 8601 week number (the "Week 29" in the picker). */
export function isoWeekNumber(weekStart: string): number {
  // The ISO week number of a week is determined by its Thursday.
  const thursday = fromDateKey(addDaysKey(weekStart, 3));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const days = Math.round(
    (thursday.getTime() - yearStart.getTime()) / 86400000,
  );
  return Math.floor(days / 7) + 1;
}

// ⚠️ A DATE IS NOT A STRING TO TRANSLATE – it is a different SHAPE per
// language, which is why these live here rather than in the locale files.
// Danish puts the day first, keeps the month in lower case and puts it after
// the range: "13.-19. juli", never "juli 13-19".
const MONTHS_DA = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];
// Written out rather than sliced: Danish abbreviates with a full stop, except
// "maj", which is already short enough not to take one. Slicing to three would
// produce "maj.".
const MONTHS_DA_SHORT = [
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "maj",
  "jun.",
  "jul.",
  "aug.",
  "sep.",
  "okt.",
  "nov.",
  "dec.",
];

/**
 * "July 13-19" within one month, "Jul 27 – Aug 2" across months.
 * In Danish: "13.-19. juli" and "27. jul. – 2. aug."
 *
 * The English branch is byte-for-byte what it always was – the label sits in a
 * `numberOfLines={1}` slot in the week switcher, so a change of shape is a
 * change to Thomas's design, not a translation.
 */
export function weekRangeLabel(weekStart: string): string {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(addDaysKey(weekStart, 6));
  if (locale === "da") {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}.-${end.getDate()}. ${MONTHS_DA[start.getMonth()]}`;
    }
    const shortDa = (d: Date) =>
      `${d.getDate()}. ${MONTHS_DA_SHORT[d.getMonth()]}`;
    return `${shortDa(start)} – ${shortDa(end)}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()}-${end.getDate()}`;
  }
  const short = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  return `${short(start)} – ${short(end)}`;
}

// (relativeWeekTitle retired 2026-07-17: the header IS the week switcher
// now – dates + week number are the anchor, no relative title.)
