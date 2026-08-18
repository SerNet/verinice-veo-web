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
import { upperFirst } from 'lodash';
import HtmlRenderer from '~/components/base/HtmlRenderer.vue';
import catalogQueryDefinitions from '~/composables/api/queryDefinitions/catalogs';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~/composables/api/utils/query';
import { useNavigation } from '~/composables/navigation';

type TranslateFn = (key: string, named?: Record<string, unknown>) => string;

export interface IVeoObjectTableNoDataTextParameters {
  domainId: Ref<string | undefined>;
  filter: Ref<Record<string, any>>;
  translations: Ref<any>;
  locale: Ref<string>;
  t: TranslateFn;
  hasItems: Ref<boolean | number | undefined>;
}

export function useObjectTableNoDataText({
  domainId,
  filter,
  translations,
  locale,
  t,
  hasItems
}: IVeoObjectTableNoDataTextParameters) {
  const { navigateToCatalog } = useNavigation();

  const isDomainKnown = computed(() => !!domainId.value);

  const typeCountQueryParameters = computed(() => ({ domainId: domainId.value as string }));
  const { data: catalogItemTypeCount } = useQuery(
    catalogQueryDefinitions.queries.fetchCatalogItemTypeCount,
    typeCountQueryParameters,
    { enabled: isDomainKnown }
  );

  const domainQueryParameters = computed(() => ({ id: domainId.value as string }));
  const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, domainQueryParameters, {
    enabled: isDomainKnown
  });

  const objectType = computed<string | undefined>(() => filter.value?.objectType);
  const subType = computed<string | undefined>(() => filter.value?.subType);

  const isRepresentedInCatalog = computed(() => {
    const subTypeCounts = objectType.value ? catalogItemTypeCount.value?.[objectType.value] : undefined;
    if (!subTypeCounts) return false;
    if (subType.value) return (subTypeCounts[subType.value] ?? 0) > 0;
    return Object.values(subTypeCounts).some((count) => count > 0);
  });

  const translatedType = computed(() => {
    const translationKey = subType.value ? `${objectType.value}_${subType.value}_plural` : `${objectType.value}_plural`;
    const elementTypeTranslations =
      objectType.value ?
        domain.value?.elementTypeDefinitions?.[objectType.value]?.translations?.[locale.value]
      : undefined;
    const translatedPlural = (
      elementTypeTranslations?.[translationKey] ?? translations.value?.lang?.[locale.value]?.[translationKey]
    )?.toString();
    return upperFirst(translatedPlural || subType.value || objectType.value || t('objects'));
  });

  const noDataText = computed(() => {
    if (hasItems.value) return () => h(HtmlRenderer, { content: t('noSearchResults') });

    if (!isRepresentedInCatalog.value) {
      const createOnlyKey = subType.value ? 'noSubTypeInUnit' : 'noObjectTypeInUnit';
      return () => h(HtmlRenderer, { content: t(createOnlyKey, { type: translatedType.value }) });
    }

    return () =>
      h(HtmlRenderer, {
        content: t('noObjectsInUnitApplyFromCatalog', {
          type: translatedType.value,
          catalogLink: `<a href="#">${t('catalog')}</a>`
        }),
        clickHandler: navigateToCatalog,
        clickHandlerParams: [objectType.value, subType.value]
      });
  });

  return { noDataText };
}
