/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const navigateToCatalog = vi.fn();
const catalogItemTypeCount = ref<Record<string, Record<string, number>> | undefined>(undefined);
const domain = ref<Record<string, any> | undefined>(undefined);

vi.mock('~/composables/navigation', () => ({
  useNavigation: () => ({ navigateToCatalog, navigateToObject: vi.fn() })
}));

vi.mock('~/composables/api/utils/query', () => ({
  STALE_TIME: { REQUEST: 0, SHORT: 0, MEDIUM: 0, LONG: 0, INFINITY: 0 },
  useQuery: (queryDefinition: { primaryQueryKey: string }) => ({
    data: queryDefinition.primaryQueryKey === 'catalogItemTypeCount' ? catalogItemTypeCount : domain
  })
}));

const { useObjectTableNoDataText } = await import('~/composables/useObjectTableNoDataText');

// Object type plurals come from the aggregated translations endpoint...
const TRANSLATIONS = { lang: { de: { control_plural: 'Controls', asset_plural: 'Assets' } } };

// ...while sub type plurals are only part of the domain.
const DOMAIN = {
  elementTypeDefinitions: {
    control: {
      translations: {
        de: {
          control_CTL_Module_plural: 'Bausteine',
          control_CTL_OrganizationalMeasure_plural: 'Organisationsspezifische Maßnahmen'
        }
      }
    }
  }
};

// Only the catalog contents decide the message, never the domain or sub type name itself.
const CATALOG = { control: { CTL_Module: 42 } };

function buildNoDataText({
  filter,
  typeCount = CATALOG,
  hasItems = false
}: {
  filter: Record<string, any>;
  typeCount?: Record<string, Record<string, number>>;
  hasItems?: boolean;
}) {
  catalogItemTypeCount.value = typeCount;
  domain.value = DOMAIN;

  const { noDataText } = useObjectTableNoDataText({
    domainId: ref('domain-id'),
    filter: ref(filter),
    translations: ref(TRANSLATIONS),
    locale: ref('de'),
    t: (key, named) => (named ? `${key} ${JSON.stringify(named)}` : key),
    hasItems: ref(hasItems)
  });

  return noDataText.value().props;
}

beforeEach(() => navigateToCatalog.mockReset());

describe('useObjectTableNoDataText()', () => {
  it('blames the search if the unit does contain matching objects', () => {
    const props = buildNoDataText({ filter: { objectType: 'control', subType: 'CTL_Module' }, hasItems: true });

    expect(props?.content).toBe('noSearchResults');
  });

  it('links to the catalog if the filtered sub type is part of the catalog', () => {
    const props = buildNoDataText({ filter: { objectType: 'control', subType: 'CTL_Module' } });

    expect(props?.content).toContain('noObjectsInUnitApplyFromCatalog');
    expect(props?.content).toContain('Bausteine');
    expect(props?.clickHandler).toBe(navigateToCatalog);
    expect(props?.clickHandlerParams).toEqual(['control', 'CTL_Module']);
  });

  it('only asks to create an object if the filtered sub type is not part of the catalog', () => {
    const props = buildNoDataText({ filter: { objectType: 'control', subType: 'CTL_OrganizationalMeasure' } });

    expect(props?.content).toContain('noSubTypeInUnit');
    expect(props?.content).toContain('Organisationsspezifische Maßnahmen');
    expect(props?.clickHandler).toBeUndefined();
  });

  it('links to the catalog if no sub type is filtered but the object type is part of the catalog', () => {
    const props = buildNoDataText({ filter: { objectType: 'control' } });

    expect(props?.content).toContain('noObjectsInUnitApplyFromCatalog');
    expect(props?.content).toContain('Controls');
    expect(props?.clickHandlerParams).toEqual(['control', undefined]);
  });

  it('only asks to create an object if the object type is not part of the catalog', () => {
    const props = buildNoDataText({ filter: { objectType: 'asset' } });

    expect(props?.content).toContain('noObjectTypeInUnit');
    expect(props?.content).toContain('Assets');
    expect(props?.clickHandler).toBeUndefined();
  });

  it('treats sub types the catalog knows but has no items for as absent', () => {
    const props = buildNoDataText({
      filter: { objectType: 'control', subType: 'CTL_Module' },
      typeCount: { control: { CTL_Module: 0 } }
    });

    expect(props?.content).toContain('noSubTypeInUnit');
  });
});
