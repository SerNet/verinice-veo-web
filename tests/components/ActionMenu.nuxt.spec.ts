import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import ActionMenu from '~/components/object/ActionMenu.vue';
import type { IVeoEntity } from '~/types/VeoTypes.ts';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains.ts';
import type { TVeoDomain } from '~/composables/domains/useDomains.ts';
import type { DeepPartial } from '~/tests/components/helpers.ts';
import { defineViewport } from '~/tests/components/helpers.ts';

beforeAll(() => {
  defineViewport();
});

const rawDomain: Partial<IVeoDomain> = vi.hoisted(() => ({
  id: '329a9132-32ca-4620-a8f6-229aa17bf49f',
  name: 'Schmutzschutz',
  controlImplementationConfiguration: {
    complianceControlSubTypes: []
  }
}));
const domain: DeepPartial<TVeoDomain> = vi.hoisted(() => ({
  id: rawDomain.id,
  name: rawDomain.name,
  raw: rawDomain
}));
mockNuxtImport('useCurrentDomain', () => {
  return () => ({
    data: { value: domain },
    isLoading: { value: false },
    isError: { value: false }
  });
});
mockNuxtImport('useRoute', () => {
  return () => ({ params: { domain: domain.id } });
});
mockNuxtImport('useVeoPermissions', () => {
  return () => ({
    ability: ref({ can: () => true }),
    subject: (_type: string, value: unknown) => value
  });
});
mockNuxtImport('useMutation', () => {
  return () => ({});
});

describe('Action menu', () => {
  it('allows adding compliance controls with different subtypes', async () => {
    // given two compliance control subtypes
    rawDomain.controlImplementationConfiguration.complianceControlSubTypes = ['typeOne', 'typeTwo'];
    const wrapper = await mountSuspended(ActionMenu, {
      props: {
        object: {
          name: 'brocess'
        } as IVeoEntity,
        type: 'controls',
        canManageUnitContent: true
      }
    });

    // expect an add button to be present
    const addButton = wrapper.find('[data-veo-test="object-details-actions-button"]');
    expect(addButton.attributes('title')).toBe('connectcontrols');
    expect(addButton.attributes('disabled')).toBeFalsy();

    // when clicking it
    await addButton.trigger('click');

    // then one action per subtype is shown
    const actionItems = document.body.querySelectorAll('[data-veo-test="action-selection-nav-item"]');
    expect(actionItems.length).toBe(2);
    expect(
      actionItems
        .values()
        .map((i) => i.textContent)
        .toArray()
    ).toEqual(['linkControl', 'linkControl']);
  });
});
