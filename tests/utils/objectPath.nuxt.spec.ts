import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import type { ObjectPathTarget } from '~/utils/objectPath';
import { getObjectDetailPath, renderObjectLink } from '~/utils/objectPath';

const params = { unit: 'unit-1', domain: 'domain-1' };

describe('getObjectDetailPath', () => {
  it('builds the detail path of an object', () => {
    expect(getObjectDetailPath({ id: 'obj-1', type: 'process', subType: 'PRO_DataProcessing' }, params)).toBe(
      '/unit-1/domains/domain-1/processes/PRO_DataProcessing/obj-1/'
    );
  });

  it('uses the "-" placeholder if the subType is unknown', () => {
    expect(getObjectDetailPath({ id: 'scn-1', type: 'scenario' }, params)).toBe(
      '/unit-1/domains/domain-1/scenarios/-/scn-1/'
    );
  });

  it.each([
    ['no target', undefined, params],
    ['a missing id', { type: 'process', subType: 'PRO_DataProcessing' }, params],
    ['a missing type', { id: 'obj-1', subType: 'PRO_DataProcessing' }, params],
    ['an unknown type', { id: 'obj-1', type: 'unicorn', subType: 'PRO_DataProcessing' }, params],
    ['a missing unit', { id: 'obj-1', type: 'process' }, { domain: 'domain-1' }],
    ['a missing domain', { id: 'obj-1', type: 'process' }, { unit: 'unit-1' }]
  ])('returns undefined for %s', (_name, target, routeParams) => {
    expect(getObjectDetailPath(target, routeParams)).toBeUndefined();
  });
});

describe('renderObjectLink', () => {
  const mountLink = (
    target: ObjectPathTarget | undefined,
    options: { bold?: boolean; class?: string } = {},
    onRowClick: (event: MouseEvent) => void = () => {}
  ) =>
    mountSuspended(
      defineComponent({
        // The link is always rendered inside a clickable table row, so mount it in one
        render: () => h('tr', { onClick: onRowClick }, [renderObjectLink('Datenverlust', target, params, options)])
      })
    );

  it('renders a link to the detail page of the object', async () => {
    const wrapper = await mountLink({ id: 'scn-1', type: 'scenario', subType: 'SCN_Scenario' });

    const link = wrapper.get('a');
    expect(link.attributes('href')).toBe('/unit-1/domains/domain-1/scenarios/SCN_Scenario/scn-1/');
    expect(link.text()).toBe('Datenverlust');
    expect(link.classes()).toContain('veo-element-link');
  });

  it('adds the passed class to the link', async () => {
    const wrapper = await mountLink({ id: 'scn-1', type: 'scenario' }, { class: 'table-row-link' });

    expect(wrapper.get('a').classes()).toContain('table-row-link');
  });

  it('renders the link in bold if requested', async () => {
    const wrapper = await mountLink({ id: 'scn-1', type: 'scenario' }, { bold: true });

    expect(wrapper.get('a').attributes('style')).toContain('font-weight: bold');
  });

  it('does not bubble the click up to the surrounding row', async () => {
    const onRowClick = vi.fn();
    const wrapper = await mountLink({ id: 'scn-1', type: 'scenario' }, {}, onRowClick);

    await wrapper.get('a').trigger('click');

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('renders a plain span if no detail path can be built', async () => {
    const wrapper = await mountLink({ id: 'scn-1', type: 'unicorn' });

    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.get('span').text()).toBe('Datenverlust');
  });

  it('keeps the row clickable if no detail path can be built', async () => {
    const onRowClick = vi.fn();
    const wrapper = await mountLink(undefined, {}, onRowClick);

    await wrapper.get('span').trigger('click');

    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
