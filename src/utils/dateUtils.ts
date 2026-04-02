export function getTodayString(): string {
  return formatDate(new Date());
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysBetween(start: string, end: string): number {
  const diff = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function subtractDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function formatDisplayDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function isPast(dateStr: string): boolean {
  return dateStr < getTodayString();
}

// Returns the Monday-aligned week index for a given date string
export function getDayOfWeek(dateStr: string): number {
  const d = parseDate(dateStr).getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // convert to Mon=0 ... Sun=6
}

// Get an array of date strings for the last N days (oldest first)
export function getLastNDays(n: number): string[] {
  const today = getTodayString();
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(subtractDays(today, i));
  }
  return days;
}

// Group an array of date strings into weeks (arrays of 7), padding the first week
export function groupIntoWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return [];

  const firstDow = getDayOfWeek(dates[0]);
  const padded: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...dates,
  ];

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}
