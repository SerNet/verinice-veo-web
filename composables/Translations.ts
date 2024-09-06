/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
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
import domainQueryDefinitions, { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { VeoElementTypesSingular } from '~/types/VeoTypes';
import translationsQueryDefinitions from './api/queryDefinitions/translations';
import { useQuery, useQuerySync } from './api/utils/query';

type TranslateSubTypeParams = {
  domainSchema: IVeoDomain | undefined;
  locale: string;
  subType: string | undefined;
  elementType?: string | undefined;
};

type UseTranslationsParams = { domain: string | string[]; languages?: string[] };

// Shared translation cache
const translationCache = reactive({
  data: null,
  isLoading: false,
  error: null,
  isFetching: false,
  fetchPromise: null
});

export function useTranslations({ domain }: UseTranslationsParams) {
  const { data, isLoading, error } = toRefs(translationCache);

  function fetchTranslations({ domain }: UseTranslationsParams) {
    if (translationCache.isFetching) {
      return translationCache.fetchPromise;
    }

    if (data.value) return Promise.resolve(data.value);
    translationCache.isFetching = true;
    isLoading.value = true;
    translationCache.fetchPromise = useQuerySync(translationsQueryDefinitions.queries.fetch, {
      languages: ['en', 'de'],
      domain
    })
      .then((fetchedData) => {
        data.value = fetchedData;
        return fetchedData;
      })
      .catch((err) => {
        console.error(err);
        error.value = err;
        throw err;
      })
      .finally(() => {
        translationCache.isFetching = false;
        isLoading.value = false;
        translationCache.fetchPromise = null;
      });
    return translationCache.fetchPromise;
  }

  fetchTranslations({ domain });
  return {
    data,
    isLoading,
    error
  };
}

function translateSubType({ domainSchema, locale, subType, elementType }: TranslateSubTypeParams) {
  if (!subType || subType === '-') return 'all';
  if (!domainSchema || !elementType) return;
  return domainSchema.elementTypeDefinitions[elementType]?.translations[locale]?.[`${elementType}_${subType}_plural`];
}

export function useSubTypeTranslation(_elementType?: string, _subType?: string) {
  const route = useRoute();
  const { locale } = useI18n();

  const domainId = computed<string | undefined>(() => route.params.domain as string);
  const elementType = computed(() => {
    if (_elementType) return _elementType;
    if (route.params?.objectType)
      return VeoElementTypesSingular[route.params?.objectType as keyof typeof VeoElementTypesSingular];
    return route.query.type as string | undefined;
  });

  const subType = computed<string | undefined>(() => {
    if (_subType) return _subType;
    return (route.params?.subType ?? route.query?.subType) as string | undefined;
  });

  // Translations are found in domain, so we fetch it:
  const domainSchemaQueryEnabled = computed(() => !!domainId.value);

  const queryParameters = computed(() => ({ id: domainId.value }));
  const { data: domainSchema } = useQuery(
    domainQueryDefinitions.queries.fetchDomain,
    queryParameters as Ref<{ id: string }>,
    {
      enabled: domainSchemaQueryEnabled
    }
  );

  return {
    subTypeTranslation: computed(() =>
      translateSubType({
        domainSchema: domainSchema.value,
        locale: locale.value,
        subType: subType.value,
        elementType: elementType.value
      })
    )
  };
}
