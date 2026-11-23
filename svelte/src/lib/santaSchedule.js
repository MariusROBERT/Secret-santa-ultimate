import {
  CalendarDateTime,
  fromDate,
  getLocalTimeZone,
  toCalendarDate,
} from '@internationalized/date';

/** @param {import('@internationalized/date').AnyCalendarDate} date @param {string} [timeZone] */
export function getDrawingInstant(date, timeZone = getLocalTimeZone()) {
  return new CalendarDateTime(date.calendar, date.era, date.year, date.month, date.day, 8)
    .toDate(timeZone)
    .getTime();
}

/** @param {Date} [now] @param {string} [timeZone] */
export function getEarliestDrawingDate(now = new Date(), timeZone = getLocalTimeZone()) {
  const localToday = toCalendarDate(fromDate(now, timeZone));
  return getDrawingInstant(localToday, timeZone) > now.getTime()
    ? localToday
    : localToday.add({ days: 1 });
}

/** @param {number} timestamp @param {number} [now] */
export function isFutureDrawingInstant(timestamp, now = Date.now()) {
  return Number.isFinite(timestamp) && timestamp > now;
}
