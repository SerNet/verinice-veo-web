import { describe, expect, it } from 'vitest';

import { formatDuration, normalizeDurationParts, parseDuration } from '../duration';

describe('duration utilities', () => {
  it('parses days into weeks and remaining days', () => {
    expect(parseDuration('P17DT4H5M6S')).toEqual({
      weeks: 2,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6
    });
  });

  it('parses a duration expressed in weeks', () => {
    expect(parseDuration('P3W')).toEqual({
      weeks: 3,
      days: undefined,
      hours: undefined,
      minutes: undefined,
      seconds: undefined
    });
  });

  it('formats all entered fields as a valid duration', () => {
    expect(
      formatDuration({
        weeks: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6
      })
    ).toBe('P17DT4H5M6S');
  });

  it('preserves an explicitly entered zero', () => {
    expect(formatDuration({ hours: 0 })).toBe('PT0H');
    expect(formatDuration({ weeks: 0 })).toBe('P0W');
    expect(formatDuration({ days: 0 })).toBe('P0D');
    expect(parseDuration('P0W').weeks).toBe(0);
    expect(parseDuration('P0D').days).toBe(0);
  });

  it('returns undefined when every field is empty', () => {
    expect(formatDuration({})).toBeUndefined();
    expect(parseDuration(undefined)).toEqual({
      weeks: undefined,
      days: undefined,
      hours: undefined,
      minutes: undefined,
      seconds: undefined
    });
  });

  it('normalizes overflow across split fields', () => {
    expect(normalizeDurationParts({ days: 9 })).toEqual({
      weeks: 1,
      days: 2,
      hours: undefined,
      minutes: undefined,
      seconds: undefined
    });
    expect(normalizeDurationParts({ hours: 27 })).toEqual({
      weeks: undefined,
      days: 1,
      hours: 3,
      minutes: undefined,
      seconds: undefined
    });
    expect(normalizeDurationParts({ minutes: 90 })).toEqual({
      weeks: undefined,
      days: undefined,
      hours: 1,
      minutes: 30,
      seconds: undefined
    });
    expect(normalizeDurationParts({ seconds: 3661 })).toEqual({
      weeks: undefined,
      days: undefined,
      hours: 1,
      minutes: 1,
      seconds: 1
    });
  });
});
