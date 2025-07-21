/*
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
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
import { StorageSerializers, useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import { getElementTypeKeys, getNavigationKeys } from './shortcutConfig';
import { CATEGORY_DOMAIN_NAVIGATION, type ShortcutAction } from './types';

// Route name imports
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/catalog/index.vue';
import { ROUTE_NAME as EDITOR_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/editor/index.vue';
import { ROUTE_NAME as RISKS_MATRIX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/risks/[definition]/index.vue';

export function useDomainShortcuts() {
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const { data: currentDomain } = useCurrentDomain();
  const miniVariant = useStorage(LOCAL_STORAGE_KEYS.PRIMARY_NAV_MINI_VARIANT, false, localStorage, {
    serializer: StorageSerializers.boolean
  });

  const domainId = computed(() => route?.params?.domain as string);
  const unitId = computed(() => route?.params?.unit as string);
  const isDomainPage = computed(() => !!(route?.params?.unit && route?.params?.domain));

  const createBaseShortcuts = (): ShortcutAction[] => [
    {
      id: 'nav-home',
      name: t('shortcuts.navigation.home.name'),
      description: t('shortcuts.navigation.home.description'),
      keys: getNavigationKeys('home'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () => router.push(`/${unitId.value}/domains/${domainId.value}`)
    },
    {
      id: 'dom-to_editor',
      name: t('shortcuts.navigation.editor.name'),
      description: t('shortcuts.navigation.editor.description'),
      keys: getNavigationKeys('editor'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () =>
        router.push({
          name: EDITOR_ROUTE_NAME,
          params: { unit: unitId.value, domain: domainId.value }
        })
    },
    {
      id: 'nav-catalogs',
      name: t('shortcuts.navigation.catalogs.name'),
      description: t('shortcuts.navigation.catalogs.description'),
      keys: getNavigationKeys('catalogs'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () =>
        router.push({
          name: CATALOGS_CATALOG_ROUTE_NAME,
          params: { unit: unitId.value, domain: domainId.value }
        })
    },
    {
      id: 'nav-reports',
      name: t('shortcuts.navigation.reports.name'),
      description: t('shortcuts.navigation.reports.description'),
      keys: getNavigationKeys('reports'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () => router.push(`/${unitId.value}/domains/${domainId.value}/reports`)
    },
    {
      id: 'nav-risks',
      name: t('shortcuts.navigation.riskDefinitions.name'),
      description: t('shortcuts.navigation.riskDefinitions.description'),
      keys: getNavigationKeys('riskDefinitions'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () => {
        const riskDefinitions = currentDomain.value?.riskDefinitions || {};
        const firstRiskDefinitionId = Object.keys(riskDefinitions)[0];

        if (firstRiskDefinitionId) {
          router.push({
            name: RISKS_MATRIX_ROUTE_NAME,
            params: {
              unit: unitId.value,
              domain: domainId.value,
              definition: firstRiskDefinitionId
            }
          });
        }
      }
    },
    {
      id: 'nav-menu',
      name: t('shortcuts.navigation.menu.name'),
      description: t('shortcuts.navigation.menu.description'),
      keys: getNavigationKeys('menu'),
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () => {
        miniVariant.value = !miniVariant.value;
      }
    }
  ];

  const createElementTypeShortcuts = (): ShortcutAction[] => {
    const elementTypes = Object.keys(VeoElementTypePlurals) as Array<keyof typeof VeoElementTypePlurals>;

    return elementTypes.map((elementType) => {
      const subTypes = currentDomain.value?.raw?.elementTypeDefinitions?.[elementType]?.subTypes;
      const isDisabled = !subTypes || Object.keys(subTypes).length === 0;

      return {
        id: `nav-${elementType}`,
        name: t('shortcuts.elements.name', { elementType }),
        description: t('shortcuts.elements.description', { elementType }),
        keys: getElementTypeKeys(elementType),
        category: CATEGORY_DOMAIN_NAVIGATION,
        disabled: isDisabled,
        action: () =>
          router.push({
            name: OBJECT_OVERVIEW_ROUTE_NAME,
            params: {
              unit: route?.params?.unit,
              domain: route?.params?.domain,
              objectType: VeoElementTypePlurals[elementType as keyof typeof VeoElementTypePlurals],
              subType: '-'
            }
          })
      };
    });
  };

  const domainShortcuts = computed<ShortcutAction[]>(() => {
    if (!isDomainPage.value) return [];
    return [...createBaseShortcuts(), ...createElementTypeShortcuts()];
  });

  return {
    data: domainShortcuts
  };
}
