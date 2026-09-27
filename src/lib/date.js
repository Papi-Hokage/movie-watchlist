// Today's date as YYYY-MM-DD in the user's local timezone.
// (toISOString() would use UTC and roll over to tomorrow in the evening in US timezones.)
export function todayLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
