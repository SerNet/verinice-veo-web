import { useQuery, useQuerySync } from './api/utils/query';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import translationsQueryDefinitions from './api/queryDefinitions/translations';
import { VeoElementTypesSingular } from '~/types/VeoTypes';
import { IVeoDomain } from '~/composables/api/queryDefinitions/domains';

type TranslateSubTypeParams = {
  domainSchema: IVeoDomain | undefined;
  locale: string;
  subType: string | undefined;
  elementType?: string | undefined;
};

type UseTranslationsParams = { domain: string | string[]; languages?: string[] };

export function useTranslations({ domain, languages = ['en', 'de'] }: UseTranslationsParams) {
  const data = ref();
  const isLoading = ref();
  const error = ref();

  async function fetchTranslations({ languages, domain }: UseTranslationsParams) {
    if (!languages?.length) return;
    isLoading.value = true;

    try {
      data.value = await useQuerySync(translationsQueryDefinitions.queries.fetch, { languages, domain });
    } catch (err) {
      console.error(err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  fetchTranslations({ languages, domain });

  return {
    data,
    isLoading,
    error
  };
}

function translateSubType({ domainSchema, locale, subType, elementType }: TranslateSubTypeParams) {
  if (!subType) subType = 'all';
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
