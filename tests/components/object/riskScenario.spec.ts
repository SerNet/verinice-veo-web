import { describe, expect, it } from 'vitest';

import { getScenarioName } from '~/composables/risk/riskScenario';

describe('getScenarioName', () => {
  it('should return an empty string when scenario is missing', () => {
    expect(getScenarioName()).toBe('');
    expect(getScenarioName(undefined)).toBe('');
    expect(getScenarioName(null)).toBe('');
    expect(getScenarioName({})).toBe('');
  });

  it('should remove a leading numeric scenario code without a following space', () => {
    // given
    const scenario = {
      abbreviation: 'G 0.28',
      displayName: '0.28Software-Schwachstellen oder -Fehler'
    };

    // when
    const result = getScenarioName(scenario);

    // then
    expect(result).toBe('Software-Schwachstellen oder -Fehler');
  });

  it('should return the dedicated scenario name when it is available', () => {
    // given
    const scenario = {
      abbreviation: 'G 0.28',
      displayName: '0.28 Software-Schwachstellen',
      name: 'Software-Schwachstellen'
    };

    // when
    const result = getScenarioName(scenario);

    // then
    expect(result).toBe('Software-Schwachstellen');
  });

  it('should remove a leading numeric scenario code from the display name', () => {
    // given
    const scenario = {
      abbreviation: 'G 0.28',
      displayName: '0.28 Software-Schwachstellen'
    };

    // when
    const result = getScenarioName(scenario);

    // then
    expect(result).toBe('Software-Schwachstellen');
  });

  it('should remove a one-letter prefix followed by the numeric scenario code', () => {
    // given
    const scenario = {
      abbreviation: 'G 0.28',
      displayName: 'G 0.28 Software-Schwachstellen'
    };

    // when
    const result = getScenarioName(scenario);

    // then
    expect(result).toBe('Software-Schwachstellen');
  });

  it('should keep the original display name when no abbreviation prefix is present', () => {
    // given
    const scenario = {
      abbreviation: 'G 0.28',
      displayName: 'Software-Schwachstellen'
    };

    // when
    const result = getScenarioName(scenario);

    // then
    expect(result).toBe('Software-Schwachstellen');
  });
});
