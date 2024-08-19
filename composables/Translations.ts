import { useQuery, useQuerySync } from './api/utils/query';
import formsQueryDefinitions from './api/queryDefinitions/forms';
import translationsQueryDefinitions from './api/queryDefinitions/translations';
import { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { VeoElementTypesSingular } from '~/types/VeoTypes';

type TranslateSubTypeParams = {
  formSchemas: IVeoFormSchemaMeta[] | undefined;
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

function translateSubType({ formSchemas, locale, subType, elementType }: TranslateSubTypeParams) {
  if (!subType) subType = 'all';
  if (!formSchemas) return;

  const formSchema = formSchemas?.find((formSchema) => {
    if (!elementType) {
      return formSchema.subType === subType;
    }

    return formSchema.modelType === elementType && formSchema.subType === subType;
  });

  const translation = formSchema?.name[locale] || subType;
  return translation;
}

export function useSubTypeTranslation() {
  const route = useRoute();
  const { locale } = useI18n();

  const domainId = computed(() => route.params.domain as string);
  const elementType = computed(() => {
    if (route.params?.objectType) {
      return VeoElementTypesSingular[route.params?.objectType as keyof typeof VeoElementTypesSingular];
    }
    return route.query.type as string;
  });

  const subType = computed(() => (route.query.subType as string) ?? route.params.subType);

  // Translations are found in forms, so we fetch them:
  const allFormSchemasQueryEnabled = computed(() => !!domainId);
  const queryParameters = computed(() => ({
    domainId: domainId.value
  }));
  const { data: formSchemas } = useQuery(formsQueryDefinitions.queries.fetchForms, queryParameters, {
    enabled: allFormSchemasQueryEnabled,
    placeholderData: []
  });

  return {
    subTypeTranslation: computed(() =>
      translateSubType({
        formSchemas: formSchemas.value,
        locale: locale.value,
        subType: subType.value,
        elementType: elementType.value
      })
    )
  };
}
