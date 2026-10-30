import { describe, expect, it } from 'vitest';

import { evaluateRule } from '~/components/dynamic-form/util';
import type { IVeoFormElementFormSchemaRule } from '~/components/dynamic-form/types';

const rule = (effect: IVeoFormElementFormSchemaRule['effect']): IVeoFormElementFormSchemaRule => ({
  effect,
  condition: {
    scope: '#/properties/status',
    schema: { const: 'YES' }
  }
});

describe('evaluateRule', () => {
  it.each([
    ['HIDE', 'YES', { visible: false, disabled: false }],
    ['HIDE', 'NO', { visible: true, disabled: false }],
    ['SHOW', 'YES', { visible: true, disabled: false }],
    ['SHOW', 'NO', { visible: false, disabled: false }],
    ['DISABLE', 'YES', { visible: true, disabled: true }],
    ['DISABLE', 'NO', { visible: true, disabled: false }],
    ['ENABLE', 'YES', { visible: true, disabled: false }],
    ['ENABLE', 'NO', { visible: true, disabled: true }]
  ] as const)('%s returns the expected state when status is %s', (effect, status, expected) => {
    expect(evaluateRule({ status }, rule(effect))).toEqual(expected);
  });
});
