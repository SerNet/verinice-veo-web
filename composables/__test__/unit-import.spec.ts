/*
 * verinice.veo web
 * Copyright (C) 2026 djm
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { describe, expect, it } from 'vitest';
import { HttpError } from '~/requests/crud';
import { extractUnitImportErrorMessages, validateUnitImportPayload } from '~/composables/unitImport';

const t = (key: string) => key;

describe('validateUnitImportPayload()', () => {
  it('accepts a complete unit import payload without validation issues', () => {
    // Given a complete unit import payload
    const payload = {
      unit: {
        name: 'Imported Unit',
        description: 'A valid import',
        domains: [{ targetUri: '/veo/domains/domain-1' }]
      },
      domains: [{ id: 'domain-1' }],
      elements: [{ id: 'element-1' }],
      risks: [{ id: 'risk-1' }]
    };

    // When the payload is validated
    const result = validateUnitImportPayload(payload, t);

    // Then no validation issues are reported
    expect(result).toEqual({
      errors: [],
      warnings: []
    });
  });

  it('reports missing unit sections including risks', () => {
    // Given an incomplete unit import payload
    const payload = {
      unit: {
        name: '',
        description: ''
      },
      domains: [],
      elements: []
    };

    // When the payload is validated
    const result = validateUnitImportPayload(payload, t);

    // Then missing sections and editable fields are reported
    expect(result.errors).toEqual(['validation.missingDomains', 'validation.missingRisks']);
    expect(result.warnings).toEqual(['validation.missingName', 'validation.missingElements']);
  });
});

describe('extractUnitImportErrorMessages()', () => {
  it('collects nested backend messages from HttpError instances', () => {
    // Given a backend import error with nested messages
    const error = new HttpError('Request failed', 400, {
      errors: ['Risks must be present.'],
      warnings: ['Imported unit contains deprecated values.'],
      message: 'Validation failed'
    });

    // When user-facing messages are extracted
    const messages = extractUnitImportErrorMessages(error);

    // Then all relevant backend messages are included
    expect(messages).toEqual(
      expect.arrayContaining([
        'Risks must be present.',
        'Imported unit contains deprecated values.',
        'Validation failed',
        'Request failed'
      ])
    );
  });
});
