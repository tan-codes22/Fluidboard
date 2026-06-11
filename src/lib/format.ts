/** Formats a timestamp as a short, human-friendly relative time. */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'just now';
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 7 * day) {
    const d = Math.floor(diff / day);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
