import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

/** Returns a human-readable "time left" string, e.g. "Ends in 3d 5h" */
export function getTimeLeft(availableUntil: string): string {
  const now = new Date();
  const end = new Date(availableUntil + "T23:59:59");
  if (now > end) return "Expired";

  const days = differenceInDays(end, now);
  const hours = differenceInHours(end, now) % 24;
  const mins = differenceInMinutes(end, now) % 60;

  if (days > 30) return `Ends in ${days}d`;
  if (days > 0) return `Ends in ${days}d ${hours}h`;
  if (hours > 0) return `Ends in ${hours}h ${mins}m`;
  return `Ends in ${mins}m`;
}
