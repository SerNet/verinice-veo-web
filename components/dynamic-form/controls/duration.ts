export interface DurationParts {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const EMPTY_DURATION: DurationParts = {
  weeks: undefined,
  days: undefined,
  hours: undefined,
  minutes: undefined,
  seconds: undefined
};

export function parseDuration(value: unknown): DurationParts {
  if (typeof value !== 'string' || !value.startsWith('P')) {
    return { ...EMPTY_DURATION };
  }

  const dateAndTime = value.slice(1);
  if (!dateAndTime) {
    return { ...EMPTY_DURATION };
  }

  const [datePart, timePart, ...rest] = dateAndTime.split('T');
  if (rest.length > 0) {
    return { ...EMPTY_DURATION };
  }

  if (datePart.includes('W')) {
    if (timePart || /[DHMS]/.test(datePart)) {
      return { ...EMPTY_DURATION };
    }

    const weeks = readUnitValue(datePart, 'W');
    if (weeks === undefined || `${weeks}W` !== datePart) {
      return { ...EMPTY_DURATION };
    }

    return {
      ...EMPTY_DURATION,
      weeks
    };
  }

  const days = readUnitValue(datePart, 'D');
  if (!isValidDatePart(datePart, days)) {
    return { ...EMPTY_DURATION };
  }

  const hours = readUnitValue(timePart || '', 'H');
  const minutes = readUnitValue(timePart || '', 'M');
  const seconds = readUnitValue(timePart || '', 'S');

  if (!isValidTimePart(timePart, hours, minutes, seconds)) {
    return { ...EMPTY_DURATION };
  }

  if (days === undefined && hours === undefined && minutes === undefined && seconds === undefined) {
    return { ...EMPTY_DURATION };
  }

  const totalDays = days || 0;

  return {
    weeks: totalDays ? Math.floor(totalDays / 7) : undefined,
    days: days === undefined ? undefined : totalDays % 7,
    hours,
    minutes,
    seconds
  };
}

export function formatDuration(parts: DurationParts): string | undefined {
  const normalizedParts = Object.fromEntries(
    Object.entries(parts).map(([key, value]) => [key, normalizeDurationPart(value)])
  ) as DurationParts;

  if (Object.values(normalizedParts).every((value) => value === undefined)) {
    return undefined;
  }

  const days = (normalizedParts.weeks || 0) * 7 + (normalizedParts.days || 0);
  const datePart = days ? `${days}D` : '';
  const timePart = [
    normalizedParts.hours !== undefined ? `${normalizedParts.hours}H` : '',
    normalizedParts.minutes !== undefined ? `${normalizedParts.minutes}M` : '',
    normalizedParts.seconds !== undefined ? `${normalizedParts.seconds}S` : ''
  ].join('');

  if (!datePart && !timePart) {
    if (normalizedParts.weeks !== undefined && normalizedParts.days === undefined) {
      return 'P0W';
    }
    if (normalizedParts.days !== undefined) {
      return 'P0D';
    }
    return 'PT0S';
  }

  return `P${datePart}${timePart ? `T${timePart}` : ''}`;
}

export function normalizeDurationPart(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : undefined;
}

function readUnitValue(part: string, unit: 'W' | 'D' | 'H' | 'M' | 'S'): number | undefined {
  if (!part.includes(unit)) {
    return undefined;
  }

  const index = part.indexOf(unit);
  const digits = part.slice(0, index).match(/\d+$/)?.[0];
  if (!digits) {
    return undefined;
  }

  return Number(digits);
}

function isValidDatePart(part: string, days: number | undefined): boolean {
  if (!part) {
    return true;
  }

  return days !== undefined && part === `${days}D`;
}

function isValidTimePart(
  part: string | undefined,
  hours: number | undefined,
  minutes: number | undefined,
  seconds: number | undefined
): boolean {
  if (part === undefined) {
    return true;
  }

  const expected = [
    hours !== undefined ? `${hours}H` : '',
    minutes !== undefined ? `${minutes}M` : '',
    seconds !== undefined ? `${seconds}S` : ''
  ].join('');

  return expected.length > 0 && part === expected;
}
