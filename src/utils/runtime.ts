const MINUTES_PER_HOUR = 60;

// Formats a runtime in minutes as "1h 52m" (or "52m" under an hour, "2h"
// on an exact hour) — the compact format most streaming-style apps use.
// No i18n here: "h"/"m" read fine in both es/en for this app's locales.
export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};
