const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

export const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const getLastBusinessDayOfMonth = (baseDate: Date) => {
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)

  while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
    lastDay.setDate(lastDay.getDate() - 1)
  }

  return normalizeDate(lastDay)
}

export const getInclusiveDaysDiff = (startDate: Date, endDate: Date) => {
  const normalizedStartDate = normalizeDate(startDate)
  const normalizedEndDate = normalizeDate(endDate)
  const diff = Math.abs(normalizedEndDate.getTime() - normalizedStartDate.getTime())

  return Math.floor(diff / MILLISECONDS_PER_DAY) + 1
}

export const setDateToStartOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const setDateToEndOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
