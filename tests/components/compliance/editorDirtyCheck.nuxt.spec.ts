import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';

import ComplianceEditor from '~/components/compliance/Editor.vue';
import type { RequirementImplementation } from '~/types/VeoTypes';

vi.mock('~/composables/api/utils/query', async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return { ...original, useQuery: () => ({ data: ref(null) }) };
});

vi.mock('~/composables/api/objects', async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return {
    ...original,
    useFetchObjects: () => ({
      data: ref({ items: [{ name: 'Alice', _self: 'http://api/persons/alice' }] })
    })
  };
});

vi.mock('@/composables/api/utils/request', async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return { ...original, useRequest: () => ({ request: vi.fn() }) };
});
vi.mock('~/utils/featureFlags', () => ({ hasFeature: () => false }));

mockNuxtImport('useRoute', () => () => ({
  params: { unit: 'unit-1', domain: 'domain-1' },
  query: {}
}));
mockNuxtImport('useVeoI18n', () => () => ({ t: (key: string) => key }));
mockNuxtImport('useVeoAlerts', () => () => ({ displayErrorMessage: vi.fn(), displaySuccessMessage: vi.fn() }));
mockNuxtImport('useRequirementImplementationQuery', () => () => ({ updateItem: vi.fn() }));
mockNuxtImport('useConfiguration', () => () => ({ data: ref({}) }));
mockNuxtImport('useCurrentDomain', () => () => ({ data: ref({ id: 'domain-1', raw: {} }) }));
mockNuxtImport('useTranslations', () => () => ({ data: ref(undefined) }));
mockNuxtImport('useSubTypeTranslation', () => () => ({ subTypeTranslation: ref('Control') }));
mockNuxtImport('useRules', () => () => ({ numberValidator: () => true, wholeNumberValidator: () => true }));
mockNuxtImport('useVeoPermissions', () => () => ({
  ability: { value: { can: () => true } },
  subject: (_type: string, value: unknown) => value
}));

beforeAll(() => {
  Object.defineProperty(window, 'visualViewport', {
    writable: true,
    configurable: true,
    value: {
      width: 800,
      height: 600,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  });
});

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  document.body.innerHTML = '';
});

const item = {
  origin: { id: 'asset-1', type: 'asset', targetUri: 'http://api/assets/asset-1' },
  control: { id: 'control-1', targetUri: 'http://api/controls/control-1' },
  status: 'UNKNOWN',
  origination: 'SYSTEM_SPECIFIC',
  implementationStatement: 'initial',
  implementationUntil: '2026-09-30'
} as unknown as RequirementImplementation;

async function mountEditor() {
  const onUpdate = vi.fn();
  const wrapper = await mountSuspended(ComplianceEditor, {
    props: { item, showDialog: true, locale: 'de', 'onUpdate:showDialog': onUpdate },
    attachTo: document.body
  });
  unmount = () => wrapper.unmount();
  await flushPromises();
  return onUpdate;
}

const buttonByText = (text: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

const click = async (el: Element | null) => {
  (el as HTMLElement).click();
  await flushPromises();
};

async function editDescription(value: string) {
  const textarea = document.querySelector(
    '[data-veo-test="compliance-editor-description"] textarea'
  ) as HTMLTextAreaElement;
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
  await flushPromises();
}

describe('ComplianceEditor dirty check', () => {
  it('closes directly via cancel when nothing was changed', async () => {
    const onUpdate = await mountEditor();
    await click(buttonByText('global.button.cancel'));
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it('closes directly via X when nothing was changed', async () => {
    const onUpdate = await mountEditor();
    await click(document.querySelector('.close-button'));
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it.each([
    ['cancel', () => buttonByText('global.button.cancel')],
    ['X', () => document.querySelector('.close-button')]
  ])('asks for confirmation via %s when the form was changed', async (_name, target) => {
    const onUpdate = await mountEditor();
    await editDescription('changed');

    await click(target());

    expect(onUpdate).not.toHaveBeenCalled();
    expect(buttonByText('global.button.yes')).toBeTruthy();
  });

  it('stays open when the confirmation is cancelled', async () => {
    const onUpdate = await mountEditor();
    await editDescription('changed');
    await click(document.querySelector('.close-button'));

    const confirmCancel = [...document.querySelectorAll('button')].filter(
      (b) => b.textContent?.trim() === 'global.button.cancel'
    );
    await click(confirmCancel[confirmCancel.length - 1]);

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('closes after discarding the changes', async () => {
    const onUpdate = await mountEditor();
    await editDescription('changed');
    await click(document.querySelector('.close-button'));

    await click(buttonByText('global.button.yes'));

    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it('is not dirty after reverting a change', async () => {
    const onUpdate = await mountEditor();
    await editDescription('changed');
    await editDescription('initial');

    await click(document.querySelector('.close-button'));

    expect(onUpdate).toHaveBeenCalledWith(false);
  });
});
