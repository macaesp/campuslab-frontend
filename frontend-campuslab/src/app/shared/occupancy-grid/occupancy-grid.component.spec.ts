import { describe, expect, it } from 'vitest';
import { localCalendarDate } from './occupancy-grid.component';

describe('Occupancy grid calendar day', () => {
  it('keeps the locally selected day late at night', () => {
    expect(localCalendarDate(new Date(2026, 10, 14, 23, 30))).toBe('2026-11-14');
  });
  it('formats month and day with two digits', () => {
    expect(localCalendarDate(new Date(2026, 0, 2, 0, 15))).toBe('2026-01-02');
  });
});
