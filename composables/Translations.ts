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
import { useQuery } from './api/utils/query';
import { useQuery as useQuery5 } from 'vue-query-v5';
import { read } from '~/requests/crud';

type TranslateSubTypeParams = {
  domainSchema: IVeoDomain | undefined;
  locale: string;
  subType: string | undefined;
  elementType?: string | undefined;
  plural: boolean;
};

type UseTranslationsParams = {
  domain?: string | string[] | Ref<string>;
  languages?: string[] | Ref<string[]>;
};

export function useTranslations(
  { domain = ref(''), languages = ref(['en', 'de']) }: UseTranslationsParams = { domain: '' }
) {
  const route = useRoute();

  const _domain = computed(() => {
    if (domain) return isRef(domain) ? domain.value : domain;
    return route.params.domain ? (route.params.domain as string) : '';
  });

  const _languages = computed(() => {
    if (Array.isArray(languages)) return languages.join(',');
    if (isRef(languages)) return languages.value.join(',');
    return languages;
  });

  const queryKey = ['translations', { domain: _domain, languages: _languages }];

  const isQueryEnabled = computed(() => !!_domain.value && _languages.value.length > 0);

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery5({
    queryKey,
    queryFn: ({ queryKey }) => {
      const { domain, languages } = queryKey[1] as { domain: string; languages: string };

      const path = `/translations?domain=${domain}&languages=${languages}`;

      return domain && languages ? read({ path }) : Promise.reject('no domain id');
    },
    enabled: isQueryEnabled,
    staleTime: 60 * 60 * 1000 // 60 minutes before refetch
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  };
}

function translateSubType({ domainSchema, locale, subType, elementType, plural }: TranslateSubTypeParams) {
  if (!subType || subType === '-') return 'all';
  if (!domainSchema || !elementType) return;
  return plural ?
      domainSchema.elementTypeDefinitions[elementType]?.translations[locale]?.[`${elementType}_${subType}_plural`]
    : domainSchema.elementTypeDefinitions[elementType]?.translations[locale]?.[`${elementType}_${subType}_singular`];
}

export function useSubTypeTranslation(_elementType?: Ref<string>, _subType?: Ref<string>, _plural: boolean = true) {
  const route = useRoute();
  const { locale } = useI18n();

  const domainId = computed<string | undefined>(() => route.params.domain as string);
  const elementType = computed(() => {
    if (isRef(_elementType)) return _elementType.value;
    if (route.params?.objectType)
      return VeoElementTypesSingular[route.params?.objectType as keyof typeof VeoElementTypesSingular];
    return route.query.type as string | undefined;
  });

  const subType = computed(() => {
    if (isRef(_subType)) return _subType.value;
    return (route.params?.subType ?? route.query?.subType) as string | undefined;
  });

  // Translations are found in domain, so we fetch it:
  const domainSchemaQueryEnabled = computed(() => !!domainId.value);

  const queryParameters = computed(() => ({ id: domainId.value }));
  const { data: domainSchema } = useQuery(
    domainQueryDefinitions.queries.fetchDomain,
    queryParameters as Ref<{ id: string }>,
    { enabled: domainSchemaQueryEnabled }
  );

  return {
    subTypeTranslation: computed(() =>
      translateSubType({
        domainSchema: domainSchema.value,
        locale: locale.value,
        subType: subType.value,
        elementType: elementType.value,
        plural: _plural
      })
    )
  };
}
