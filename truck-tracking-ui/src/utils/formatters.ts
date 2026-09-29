import { differenceInMinutes, format, formatDistanceToNowStrict, parseISO } from 'date-fns'

/** Format an ISO timestamp as e.g. "28 Sep, 10:42 AM". */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM, hh:mm a')
}

/** Format an ISO timestamp as time only, e.g. "10:42 AM". */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'hh:mm a')
}

/** Format an ISO date as e.g. "28 Sep 2026". */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy')
}

/** Humanised "x minutes ago". */
export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true })
}

/** Convert a minute count into "1h 24m" / "24m". */
export function formatDuration(minutes: number): string {
  const mins = Math.max(0, Math.round(minutes))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

/** Whole minutes elapsed between two ISO timestamps (or now). */
export function minutesBetween(startIso: string, endIso?: string): number {
  const end = endIso ? parseISO(endIso) : new Date()
  return Math.max(0, differenceInMinutes(end, parseISO(startIso)))
}

/** Format a millisecond duration as a live clock: "M:SS" or "H:MM:SS". */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
