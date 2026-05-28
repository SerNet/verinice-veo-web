import { useFetchSchemasDetailed } from '~/composables/api/schemas';
import accountQueryDefinitions from '~/composables/api/queryDefinitions/accounts';
import type { IVeoAccount } from '~/composables/api/queryDefinitions/accounts';
import formQueryDefinitions, { type IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { useQuery } from '~/composables/api/utils/query';
import { useTranslations } from '~/composables/Translations';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { extractSubTypesFromObjectSchema } from '~/lib/utils';
import type { VeoSearchFilters } from '~/types/VeoSearch';
import type { IVeoDomainSpecificObjectSchema } from '~/types/VeoTypes';

type UseObjectSearchFiltersParams = {
  domainId: MaybeRef<string>;
  excludedKeys?: MaybeRef<string[]>;
  filter?: MaybeRef<Record<string, any>>;
  availableObjectTypes?: MaybeRef<string[]>;
  availableSubTypes?: MaybeRef<string[]>;
};

export const OBJECT_FILTER_KEYS = [
  'objectType',
  'subType',
  'abbreviation',
  'designator',
  'name',
  'status',
  'description',
  'updatedBy',
  'hasNoParentElements',
  'hasChildElements'
];

const objectSearchFilters: VeoSearchFilters = {
  all: OBJECT_FILTER_KEYS.map((key) => ({ key, value: key })),
  default: { key: 'name', value: 'name' }
};

export function getObjectSearchFilters(excludedKeys: string[] = []): VeoSearchFilters {
  const all = OBJECT_FILTER_KEYS.filter((key) => !excludedKeys.includes(key)).map((key) => ({ key, value: key }));
  const defaultFilter = all.find((filter) => filter.key === objectSearchFilters.default.key) ?? all[0];

  return {
    all,
    default: defaultFilter ?? objectSearchFilters.default
  };
}

export function useObjectSearchFilters({
  domainId,
  excludedKeys = [],
  filter = {},
  availableObjectTypes = [],
  availableSubTypes = []
}: UseObjectSearchFiltersParams) {
  const { locale } = useI18n();
  const { t: globalT } = useI18n({ useScope: 'global' });
  const { ability } = useVeoPermissions();
  const { data: translations } = useTranslations({ domain: computed(() => unref(domainId)) });
  const { data: accounts } = useQuery(accountQueryDefinitions.queries.fetchAccounts, undefined, {
    enabled: computed(() => ability.value.can('view', 'accounts')),
    placeholderData: []
  });
  const { data: formSchemas } = useQuery(
    formQueryDefinitions.queries.fetchForms,
    computed(() => ({ domainId: unref(domainId) })),
    {
      enabled: computed(() => !!unref(domainId)),
      placeholderData: []
    }
  );
  const schemasQueries = useFetchSchemasDetailed(computed(() => ({ domainId: unref(domainId) })));

  const schemas = computed<IVeoDomainSpecificObjectSchema[]>(() =>
    schemasQueries.map((query) => query.data).filter((schema): schema is IVeoDomainSpecificObjectSchema => !!schema)
  );

  const filterValue = computed(() => unref(filter));
  const allowedObjectTypes = computed(() => unref(availableObjectTypes));
  const allowedSubTypes = computed(() => unref(availableSubTypes));

  function translate(key: string) {
    return translations.value?.lang?.[locale.value]?.[key] ?? key;
  }

  function translateSubType(subType: string) {
    return (
      (formSchemas.value as IVeoFormSchemaMeta[]).find((formSchema) => formSchema.subType === subType)?.name?.[
        locale.value
      ] ?? subType
    );
  }

  function toOptions(options: Array<{ value: string; title: string }>) {
    return Object.fromEntries(options.map((option) => [option.value, option.title]));
  }

  const objectTypeOptions = computed(() =>
    toOptions(
      schemas.value
        .map((schema) => schema.title)
        .filter((objectType) => !allowedObjectTypes.value.length || allowedObjectTypes.value.includes(objectType))
        .map((objectType) => ({
          value: objectType,
          title: translate(objectType)
        }))
    )
  );

  const selectedObjectType = computed(() => filterValue.value.objectType as string | undefined);
  const selectedSubType = computed(() => filterValue.value.subType as string | undefined);

  const subTypeOptions = computed(() => {
    const relevantSchemas =
      selectedObjectType.value ?
        schemas.value.filter((schema) => schema.title === selectedObjectType.value)
      : schemas.value;

    return toOptions(
      relevantSchemas
        .flatMap((schema) =>
          extractSubTypesFromObjectSchema(schema).map((subType) => ({
            value: subType.subType,
            title: translateSubType(subType.subType)
          }))
        )
        .filter((subType) => !allowedSubTypes.value.length || allowedSubTypes.value.includes(subType.value))
    );
  });

  const statusOptions = computed(() => {
    if (!selectedObjectType.value) return {};

    const schema = schemas.value.find((item) => item.title === selectedObjectType.value);
    const subTypes = schema ? extractSubTypesFromObjectSchema(schema) : [];
    const relevantSubTypes =
      selectedSubType.value ? subTypes.filter((item) => item.subType === selectedSubType.value) : subTypes;

    return toOptions(
      relevantSubTypes.flatMap((subType) =>
        subType.status.map((status) => ({
          value: status,
          title: translate(`${selectedObjectType.value}_${subType.subType}_status_${status}`)
        }))
      )
    );
  });

  const booleanOptions = computed(() => ({
    true: globalT('global.button.yes').toString()
  }));

  const editorOptions = computed(() =>
    toOptions(
      ((accounts.value ?? []) as IVeoAccount[]).flatMap((account) => {
        const options = [{ value: account.emailAddress, title: account.emailAddress }];
        if (account.username && account.username !== account.emailAddress) {
          options.push({ value: account.username, title: account.username });
        }
        return options;
      })
    )
  );

  return computed<VeoSearchFilters>(() => {
    const filters = getObjectSearchFilters(unref(excludedKeys));

    return {
      all: filters.all.map((searchFilter) => {
        switch (searchFilter.key) {
          case 'objectType':
            return { ...searchFilter, options: objectTypeOptions.value };
          case 'subType':
            return { ...searchFilter, options: subTypeOptions.value };
          case 'status':
            return { ...searchFilter, options: statusOptions.value };
          case 'updatedBy':
            return { ...searchFilter, options: editorOptions.value };
          case 'hasNoParentElements':
          case 'hasChildElements':
            return { ...searchFilter, options: booleanOptions.value };
          default:
            return searchFilter;
        }
      }),
      default: filters.default
    };
  });
}
