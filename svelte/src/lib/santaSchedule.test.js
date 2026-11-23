import { CalendarDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { getDrawingInstant, getEarliestDrawingDate } from './santaSchedule.js';

describe('Secret Santa drawing dates', () => {
  const zone = 'America/New_York';

  it('allows today at 7:59 AM and uses 8:00 AM local time', () => {
    const now = new Date('2025-02-03T12:59:00.000Z');
    const date = getEarliestDrawingDate(now, zone);

    expect(date.toString()).toBe('2025-02-03');
    expect(getDrawingInstant(date, zone)).toBe(new Date('2025-02-03T13:00:00.000Z').getTime());
  });

  it('moves the default to tomorrow at exactly 8:00 AM', () => {
    const now = new Date('2025-02-03T13:00:00.000Z');

    expect(getEarliestDrawingDate(now, zone).toString()).toBe('2025-02-04');
  });

  it('moves the default to tomorrow at 3:00 PM', () => {
    const now = new Date('2025-02-03T20:00:00.000Z');

    expect(getEarliestDrawingDate(now, zone).toString()).toBe('2025-02-04');
  });

  it('keeps 8:00 AM in the selected timezone across daylight-saving changes', () => {
    expect(getDrawingInstant(new CalendarDate(2024, 3, 9), zone)).toBe(
      new Date('2024-03-09T13:00:00.000Z').getTime(),
    );
    expect(getDrawingInstant(new CalendarDate(2024, 3, 10), zone)).toBe(
      new Date('2024-03-10T12:00:00.000Z').getTime(),
    );
    expect(getDrawingInstant(new CalendarDate(2024, 11, 3), zone)).toBe(
      new Date('2024-11-03T13:00:00.000Z').getTime(),
    );
  });
});
