/*
 * verinice.veo web
 * Copyright (C) 2026 sernet at
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

import RiskMatrix from '~/components/risk/Matrix.vue';
import type { IVeoRiskProbabilityLevel, IVeoRiskPotentialImpact, IVeoRiskValueLevel } from '~/types/VeoTypes';

const COLORS = {
  low: '#00ff00',
  medium: '#ffff00',
  high: '#ffa500',
  veryHigh: '#ff0000'
};

const probabilityLevels: IVeoRiskProbabilityLevel[] = [
  {
    htmlColor: COLORS.low,
    ordinalValue: 1,
    translations: {
      de: {
        name: 'Gering',
        abbreviation: 'G',
        description: 'Geringere Wahrscheinlichkeit'
      }
    }
  },
  {
    htmlColor: COLORS.medium,
    ordinalValue: 2,
    translations: {
      de: {
        name: 'Mittel',
        abbreviation: 'M',
        description: 'Mittlere Wahrscheinlichkeit'
      }
    }
  },
  {
    htmlColor: COLORS.high,
    ordinalValue: 3,
    translations: {
      de: {
        name: 'Hoch',
        abbreviation: 'H',
        description: 'Hohe Wahrscheinlichkeit'
      }
    }
  },
  {
    htmlColor: COLORS.veryHigh,
    ordinalValue: 4,
    translations: {
      de: {
        name: 'Sehr hoch',
        abbreviation: 'SH',
        description: 'Sehr hohe Wahrscheinlichkeit'
      }
    }
  }
];

const potentialImpacts: IVeoRiskPotentialImpact[] = [
  {
    ordinalValue: 1,
    htmlColor: COLORS.low,
    translations: {
      de: {
        name: 'Gering',
        abbreviation: 'G',
        description: 'Geringe Auswirkung'
      }
    }
  },
  {
    ordinalValue: 2,
    htmlColor: COLORS.medium,
    translations: {
      de: {
        name: 'Mittel',
        abbreviation: 'M',
        description: 'Mittlere Auswirkung'
      }
    }
  },
  {
    ordinalValue: 3,
    htmlColor: COLORS.high,
    translations: {
      de: {
        name: 'Hoch',
        abbreviation: 'H',
        description: 'Hohe Auswirkung'
      }
    }
  },
  {
    ordinalValue: 4,
    htmlColor: COLORS.veryHigh,
    translations: {
      de: {
        name: 'Sehr hoch',
        abbreviation: 'SH',
        description: 'Sehr hohe Auswirkung'
      }
    }
  }
];

const riskValues: IVeoRiskValueLevel[] = [
  {
    ordinalValue: 1,
    htmlColor: COLORS.low,
    symbolicRisk: 'LOW',
    translations: {
      de: {
        name: 'Gering',
        abbreviation: 'G',
        description: 'Geringes Risiko'
      }
    }
  },
  {
    ordinalValue: 2,
    htmlColor: COLORS.medium,
    symbolicRisk: 'MEDIUM',
    translations: {
      de: {
        name: 'Mittel',
        abbreviation: 'M',
        description: 'Mittleres Risiko'
      }
    }
  },
  {
    ordinalValue: 3,
    htmlColor: COLORS.high,
    symbolicRisk: 'HIGH',
    translations: {
      de: {
        name: 'Hoch',
        abbreviation: 'H',
        description: 'Hohes Risiko'
      }
    }
  },
  {
    ordinalValue: 4,
    htmlColor: COLORS.veryHigh,
    symbolicRisk: 'VERY HIGH',
    translations: {
      de: {
        name: 'Sehr hoch',
        abbreviation: 'SH',
        description: 'Sehr hohes Risiko'
      }
    }
  }
];

const valueMatrix: IVeoRiskValueLevel[][] = [
  [riskValues[0], riskValues[0], riskValues[1], riskValues[2]],
  [riskValues[0], riskValues[1], riskValues[2], riskValues[3]],
  [riskValues[1], riskValues[2], riskValues[3], riskValues[3]],
  [riskValues[2], riskValues[3], riskValues[3], riskValues[3]]
];

const mountRiskMatrix = async (props = {}) =>
  mountSuspended(RiskMatrix, {
    props: {
      'value-matrix': valueMatrix,
      probabilityLevels,
      potentialImpacts,
      riskValues,
      ...props
    }
  });

describe('RiskMatrix', () => {
  it('renders the risk matrix', async () => {
    const wrapper = await mountRiskMatrix();

    expect(wrapper.find('[data-veo-test="risk-matrix"]').exists()).toBe(true);
  });

  it('renders probability levels', async () => {
    const wrapper = await mountRiskMatrix();

    const probabilityRows = wrapper.find('[data-veo-test="risk-matrix-probabilities"]').findAll('tr');

    const probabilityCells = probabilityRows[1].findAll('th').slice(2);

    expect(probabilityCells).toHaveLength(4);
    expect(probabilityCells.map((cell) => cell.text())).toEqual(['Gering', 'Mittel', 'Hoch', 'Sehr hoch']);
  });

  it('renders potential impacts in reversed order', async () => {
    const wrapper = await mountRiskMatrix();

    const matrixBody = wrapper.find('[data-veo-test="risk-matrix-impacts-and-values"]');

    const dataRows = matrixBody.findAll('tr').slice(1);
    const impactNames = dataRows.map((row) => row.findAll('td')[0].text());

    expect(impactNames).toEqual(['Sehr hoch', 'Hoch', 'Mittel', 'Gering']);
  });

  it('renders autocomplete fields in edit mode', async () => {
    const wrapper = await mountRiskMatrix({
      isEditMode: true
    });

    const autocompletes = wrapper.findAllComponents({ name: 'VAutocomplete' });

    expect(autocompletes).toHaveLength(16);
  });

  it('renders risk value rows in reversed order', async () => {
    const wrapper = await mountRiskMatrix();

    const matrixBody = wrapper.find('[data-veo-test="risk-matrix-impacts-and-values"]');

    const dataRows = matrixBody.findAll('tr').slice(1);

    const visibleRows = dataRows.map((row) => row.findAll('td').map((cell) => cell.text()));

    expect(visibleRows).toEqual([
      ['Sehr hoch', 'Hoch', 'Sehr hoch', 'Sehr hoch', 'Sehr hoch'],
      ['Hoch', 'Mittel', 'Hoch', 'Sehr hoch', 'Sehr hoch'],
      ['Mittel', 'Gering', 'Mittel', 'Hoch', 'Sehr hoch'],
      ['Gering', 'Gering', 'Gering', 'Mittel', 'Hoch']
    ]);
  });
});
