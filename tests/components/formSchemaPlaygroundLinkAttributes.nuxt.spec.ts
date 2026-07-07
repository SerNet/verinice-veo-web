/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { v5 as UUIDv5 } from 'uuid';

vi.mock('~/components/editor/formSchema/playground/Element.vue', () => ({
  default: { name: 'EditorFormSchemaPlaygroundElement', template: '<div />' }
}));

import Playground, { FORMSCHEMA_PLAYGROUND_NAMESPACE } from '~/components/editor/formSchema/playground/Playground.vue';

const LINK_SCOPE = '#/properties/links/properties/process_PIA_affectedITSystems';
const RELATIVE_ATTRIBUTE_SCOPE = '#/properties/attributes/properties/process_PIA_affectedITSystems_online';

const ABSOLUTE_ATTRIBUTE_SCOPE = `${LINK_SCOPE}/items/properties/attributes/properties/process_PIA_affectedITSystems_online`;

const formSchema = {
  type: 'Layout',
  options: {
    format: 'group',
    direction: 'vertical'
  },
  elements: [
    {
      type: 'Control',
      scope: LINK_SCOPE,
      options: {
        label: '#lang/process_PIA_affectedITSystems'
      },
      elements: [
        {
          type: 'Control',
          scope: RELATIVE_ATTRIBUTE_SCOPE,
          options: {
            label: '#lang/process_PIA_affectedITSystems_online'
          }
        }
      ]
    }
  ]
};

const objectSchema = {
  properties: {
    links: {
      properties: {
        process_PIA_affectedITSystems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              target: { type: 'object' },
              attributes: {
                type: 'object',
                properties: {
                  process_PIA_affectedITSystems_online: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }
};

const mountPlayground = async () =>
  mountSuspended(Playground, {
    props: {
      modelValue: formSchema as any,
      objectSchema: objectSchema as any
    },
    global: {
      stubs: {
        EditorFormSchemaPlaygroundElement: true,
        EditorErrorDialog: true
      }
    }
  });

describe('form schema playground link attributes', () => {
  it('assigns link attribute children the UUID of their absolute scope so LinkSettings can match them', async () => {
    const wrapper = await mountPlayground();
    const vm = wrapper.vm as any;

    const linkElement = vm.playgroundElements.children[0];
    expect(linkElement.id).toBe(UUIDv5(LINK_SCOPE, FORMSCHEMA_PLAYGROUND_NAMESPACE));

    // This is how LinkSettings.vue (availableLinkAttributes) derives the UUIDs of the attribute controls
    const expectedAttributeUuid = UUIDv5(ABSOLUTE_ATTRIBUTE_SCOPE, FORMSCHEMA_PLAYGROUND_NAMESPACE);
    expect(linkElement.children).toHaveLength(1);
    expect(linkElement.children[0].id).toBe(expectedAttributeUuid);
  });

  it('stores the link attribute with its absolute scope in the form schema element map', async () => {
    const wrapper = await mountPlayground();
    const vm = wrapper.vm as any;

    const attributeUuid = UUIDv5(ABSOLUTE_ATTRIBUTE_SCOPE, FORMSCHEMA_PLAYGROUND_NAMESPACE);
    expect(vm.formSchemaElementMap.get(attributeUuid)?.scope).toBe(ABSOLUTE_ATTRIBUTE_SCOPE);
  });

  it('restores the relative link attribute scope when building the form schema', async () => {
    const wrapper = await mountPlayground();
    const vm = wrapper.vm as any;

    vm.onFormSchemaModified(vm.playgroundElements);

    const emitted = wrapper.emitted('update:model-value');
    expect(emitted).toBeTruthy();
    const builtFormSchema = emitted![emitted!.length - 1][0] as any;
    expect(builtFormSchema.elements[0].scope).toBe(LINK_SCOPE);
    expect(builtFormSchema.elements[0].elements[0].scope).toBe(RELATIVE_ATTRIBUTE_SCOPE);
  });
});
