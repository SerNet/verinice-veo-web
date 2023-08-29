import { useQuery } from './api/utils/query';
import formsQueryDefinitions from './api/queryDefinitions/forms';
import { IVeoFormSchemaMeta } from '~~/composables/api/queryDefinitions/forms';

type TranslateSubTypeParams = {
  formSchemas: IVeoFormSchemaMeta[] | undefined,
  locale: string
  subType: string | undefined,
  elementType?: string | undefined,
}

function translateSubType({ formSchemas, locale, subType, elementType }: TranslateSubTypeParams) {
  if (!formSchemas) return;

  const formSchema = formSchemas?.find(formSchema => {
    if(!elementType) {
      return formSchema.subType === subType;
    }

    return (
      formSchema.modelType === elementType &&
      formSchema.subType === subType
    );
  });

  const translation = formSchema?.name[locale] || subType;
  return translation;
}

export function useSubTypeTranslation() {
  const route = useRoute();
  const { locale } = useI18n();

  const domainId = computed(() => route.params.domain as string);
  const elementType = computed(() => route.query.type as string);
  const subType = computed(() => route.query.subType as string);

  // Translations are found in forms, so we fetch them:
  const allFormSchemasQueryEnabled = computed(() => !!domainId);
  const queryParameters = computed(() => ({
    domainId: domainId.value
  }));
  const { data: formSchemas } = useQuery(
    formsQueryDefinitions.queries.fetchForms,
    queryParameters,
    { enabled: allFormSchemasQueryEnabled, placeholderData: [] }
  );

  return {
    subTypeTranslation: computed( () => translateSubType({
      formSchemas: formSchemas.value,
      locale: locale.value,
      subType: subType.value,
      elementType: elementType.value
    }))
  };
}
