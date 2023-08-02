<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann, Samuel Vitzthum
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div
    class="px-0"
    data-component-name="breadcrumbs"
  >
    <v-breadcrumbs-item
      v-for="(item, index) of displayedBreadcrumbs"
      :key="item.key"
      :to="item.to"
      :disabled="item.disabled || item.to === $route.fullPath"
      nuxt
    >
      <span v-if="index">
        <v-icon
          color="black"
          :icon="mdiChevronRight"
          size="small"
        /></span>
      <!-- Display if the breadcrumb is visible or the amount of breadcrumbs is one over the BREADCRUMB_BREAKOFF (else there would be a single item in the list, making it kinda pointless) -->
      <template v-if="item.index < BREADCRUMB_BREAKOFF || breadcrumbs.length === BREADCRUMB_BREAKOFF + 1">
        <v-icon
          v-if="item.icon"
          class="text-primary"
          :icon="item.icon"
          size="large"
        />
        <span
          v-else-if="Object.keys(queryResultMap).includes(item.param)"
          class="breadcrumbs-item-height"
        >
          <template v-if="queryResultMap[item.param]">
            {{ queryResultMap[item.param] }}
          </template>
          <v-skeleton-loader
            v-else
            type="image"
            width="80"
            height="14"
          />
        </span>
        <span
          v-else-if="item.text"
          class="breadcrumbs-item-height"
        >
          {{ item.text }}
        </span>
      </template>
      <!-- Display the button with the list instead the last item -->
      <template v-else-if="item.index === BREADCRUMB_BREAKOFF">
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="primary"
              :icon="mdiDotsHorizontal"
              small
              @click.stop.prevent
            />
          </template>
          <template #default>
            <v-list dense>
              <v-list-group
                mandatory
                color="primary"
              >
                <v-list-item
                  v-for="menuItem of slicedBreadcrumbs"
                  v-bind="menuItem"
                  :key="menuItem.key"
                  nuxt
                  density="compact"
                >
                  <template
                    v-if="menuItem.icon"
                    #prepend
                  >
                    <v-icon
                      :icon="menuItem.icon"
                      color="primary"
                      size="large"
                    />
                  </template>
                  <v-list-item-title
                    v-if="!menuItem.icon"
                  >
                    <template v-if="Object.keys(queryResultMap).includes(menuItem.param)">
                      <template v-if="queryResultMap[item.param]">
                        {{ queryResultMap[item.param] }}
                      </template>
                      <v-skeleton-loader
                        v-else
                        type="image"
                        width="80"
                        height="14"
                      />
                    </template>
                    <template v-if="menuItem.text">
                      {{ menuItem.text }}
                    </template>
                  </v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list>
          </template>
        </v-menu>
      </template>
    </v-breadcrumbs-item>
  </div>
</template>

<script lang="ts">
import { isEmpty, last, omit, pick } from 'lodash';
import { mdiChevronRight, mdiDotsHorizontal, mdiHomeOutline } from '@mdi/js';

import { IVeoBreadcrumb, useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';
import { IVeoCatalog } from '~~/composables/api/queryDefinitions/catalogs';
import { useQuery } from '~~/composables/api/utils/query';
import catalogQueryDefinitions from '~~/composables/api/queryDefinitions/catalogs';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';
import formsQueryDefinitions, { IVeoFormSchema } from '~~/composables/api/queryDefinitions/forms';
import objectsQueryDefinitions from '~~/composables/api/queryDefinitions/objects';
import reportQueryDefinitions from '~~/composables/api/queryDefinitions/reports';
import translationsQueryDefinitions from '~~/composables/api/queryDefinitions/translations';


type SupportedQuery = ':domain' | ':subType' | ':report' | ':catalog' | ':objectType' | ':object';

interface IVeoBreadcrumbReplacementMapBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  hidden?: boolean;
  icon?: any;
  to?: string | (() => string);
  dynamicText?: (param: string, value?: string) => string;
  queriedText?: {
    query: SupportedQuery;
    parameterTransformationFn: (param: string, value?: string) => object;
    resultTransformationFn: (param: string, value: string | undefined, data: any) => string;
  };
  position?: number;
  text?: string;
}

export default defineComponent({
  props: {
    overrideBreadcrumbs: {
      type: Boolean,
      default: false
    },
    writeToTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { breadcrumbs: customBreadcrumbs } = useVeoBreadcrumbs();

    const title = ref('');

    useHead(() => ({
      title
    }));

    const BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP = new Map<string, IVeoBreadcrumbReplacementMapBreadcrumb>([
      [
        '',
        {
          hidden: true
        }
      ],
      [
        'init',
        {
          hidden: true
        }
      ],
      [
        ':unit',
        {
          hidden: true
        }
      ],
      [
        'domains',
        {
          hidden: true
        }
      ],
      [
        ':domain',
        {
          icon: mdiHomeOutline,
          queriedText: {
            query: ':domain',
            parameterTransformationFn: (_param, value) => ({ id: value }),
            resultTransformationFn: (_param, _value, data) => data.name
          }
        }
      ],
      [
        ':objectType',
        {
          queriedText: {
            query: ':objectType',
            parameterTransformationFn: () => ({ languages: [locale.value] }),
            resultTransformationFn: (_param, value, data) => data.lang[locale.value]?.[value as string]
          }
        }
      ],
      [
        ':subType',
        {
          queriedText: {
            query: ':subType',
            parameterTransformationFn: () => ({ domainId: route.params.domain }),
            resultTransformationFn: (_param, value, data) => value === '-' ? t('all') : data.find((formSchema: IVeoFormSchema) => formSchema.subType === value)?.name?.[locale.value]
          }
        }
      ],
      [
        ':object',
        {
          queriedText: {
            query: ':object',
            parameterTransformationFn: () => ({ id: route.params.object, endpoint: route.params.objectType }),
            resultTransformationFn: (_param, _value, data) => data.displayName
          }
        }
      ],
      [
        ':report', // Used for reports
        {
          queriedText: {
            query: ':report',
            parameterTransformationFn: (_param, _value) => ({}),
            resultTransformationFn: (_param, value, data) => (data ? data[value as string]?.name?.[locale.value] : undefined)
          }
        }
      ],
      [
        ':catalog',
        {
          queriedText: {
            query: ':catalog',
            parameterTransformationFn: (_param, value) => ({ id: value }),
            resultTransformationFn: catalogsTransformationFn
          }
        }
      ],
      [
        ':matrix',
        {
          dynamicText: (_param, value) => value || ''
        }
      ],
      [
        'risks',
        {
          disabled: true
        }
      ],
      [
        'docs',
        {
          to: '/docs/index'
        }
      ],
      [
        ':slug(.*)*', // Doc page gets added manually to breadcrumbs
        {
          hidden: true
        }
      ]
    ]);

    function catalogsTransformationFn(_param: string, value: string, data: IVeoCatalog[] ) {
      const catalogUUID = value;
      const catalogs = data;
      const currentCatalog = catalogs.find(catalog => {
        return catalog.id === catalogUUID;
      });
      return currentCatalog?.name;
    }

    // After this position, all breadcrumbs will be moved to a menu to avoid scrolling
    const BREADCRUMB_BREAKOFF = 4;

    // Queried text. For now we assume that every query type will only be used once (at most one object, one domain, one report is part of the path).
    // Must be refactored if for example two objects are part of the path.
    const subTypeQueryParameters = ref<any>({});
    const subTypeQueryEnabled = computed(() => !isEmpty(subTypeQueryParameters.value));
    const { data: subType } = useQuery(formsQueryDefinitions.queries.fetchForms, subTypeQueryParameters, {
      enabled: subTypeQueryEnabled
    });
    const domainQueryParameters = ref<any>({});
    const domainQueryEnabled = computed(() => !isEmpty(domainQueryParameters.value));
    const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, domainQueryParameters, {
      enabled: domainQueryEnabled
    });
    const catalogQueryParameters = ref<any>({});
    const catalogQueryEnabled = computed(() => !isEmpty(catalogQueryParameters.value));
    const { data: catalogs } = useQuery(catalogQueryDefinitions.queries.fetchCatalogs, catalogQueryParameters, {
      enabled: catalogQueryEnabled
    });

    const { data: report } = useQuery(reportQueryDefinitions.queries.fetchAll);

    const objectTypeQueryParameters = ref<any>({});
    const objectTypeQueryEnabled = computed(() => !isEmpty(objectTypeQueryParameters.value));
    const { data: objectType } = useQuery(translationsQueryDefinitions.queries.fetch, objectTypeQueryParameters, {
      enabled: objectTypeQueryEnabled
    });

    const objectQueryParameters = ref<any>({});
    const objectQueryEnabled = computed(() => !isEmpty(objectQueryParameters.value));
    const { data: object } = useQuery(objectsQueryDefinitions.queries.fetch, objectQueryParameters, {
      enabled: objectQueryEnabled
    });

    const queryResultMap = computed<{ [key: string]: any }>(() => ({
      ':catalog': catalogs.value
        ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':catalog')?.queriedText?.resultTransformationFn(':catalogs', route.params.catalog as string, catalogs.value)
        : undefined,
      ':domain': domain.value
        ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':domain')?.queriedText?.resultTransformationFn(':domain', route.params.domain as string, domain.value)
        : undefined,
      ':objectType': objectType.value
        ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':objectType')?.queriedText?.resultTransformationFn(':objectType', route.params.objectType as string, objectType.value)
        : undefined,
      ':object': object.value
        ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':object')?.queriedText?.resultTransformationFn(':object', route.params.object as string, object.value)
        : undefined,
      ':subType': subType.value
        ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':subType')?.queriedText?.resultTransformationFn(':subType', route.params.subType as string, subType.value)
        : undefined,
      ':report': report.value ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':report')?.queriedText?.resultTransformationFn(':report', route.params.report as string, report.value) : undefined
    }));

    const pathTemplate = computed(() => last(route.matched)?.path || '');

    const breadcrumbParts = computed(() => pathTemplate.value.replaceAll('()', '').split('/'));

    const generatedBreadcrumbs = computed<IVeoBreadcrumb[]>(() =>
      breadcrumbParts.value
        .filter((part) => !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(part) || !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part)?.hidden)
        .map((part, index) => {
          const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part) || {};

          return {
            param: part,
            exact: true,
            text: ['text', 'icon', 'queriedText', 'dynamicText'].some((key) => key in replacementMapEntry) ? undefined : t(`breadcrumbs.${part}`),
            index,
            key: breadcrumbParts.value.slice(0, breadcrumbParts.value.findIndex((_part) => _part === part) + 1).join('/') || '/',
            position: index * 10,
            ...pick(replacementMapEntry, ['disabled', 'exact', 'hidden', 'icon', 'position', 'text']),
            to: replacementMapEntry.to
              ? typeof replacementMapEntry.to === 'string'
                ? replacementMapEntry.to
                : replacementMapEntry.to()
              : route.fullPath
                .split('/')
                .slice(0, breadcrumbParts.value.findIndex((_part) => _part === part) + 1)
                .join('/') || '/'
          };
        })
        .map((breadcrumb) => {
          const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(breadcrumb.param) || {};
          if (replacementMapEntry?.dynamicText) {
            return {
              ...breadcrumb,
              text: replacementMapEntry.dynamicText(breadcrumb.param, route.params[breadcrumb.param.replace(/^:/, '')] as string)
            };
          } else {
            return breadcrumb;
          }
        })
    );

    const breadcrumbs = computed(() => {
      let _breadcrumbs: IVeoBreadcrumb[] = [];
      if (!props.overrideBreadcrumbs) {
        _breadcrumbs = [...generatedBreadcrumbs.value];
      }

      for (const customBreadcrumb of customBreadcrumbs.value) {
        _breadcrumbs.push({ ...customBreadcrumb, index: _breadcrumbs.length });
      }

      return _breadcrumbs.sort((breadcrumbA, breadcrumbB) => breadcrumbA.position - breadcrumbB.position);
    });

    const displayedBreadcrumbs = computed(() => breadcrumbs.value.slice(0, BREADCRUMB_BREAKOFF + 1)); // Use one breadcrumb more than would be displayed to display the "more"-button
    const slicedBreadcrumbs = computed(() => breadcrumbs.value.slice(BREADCRUMB_BREAKOFF + 1)); // Start with the breadcrumb that wouldn't be displayed

    // Put all query parameters into a map
    watch(
      () => breadcrumbs.value,
      (newValue) => {
        for (const breadcrumb of newValue) {
          const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(breadcrumb.param);
          if (replacementMapEntry?.queriedText) {
            const transformedParameters = replacementMapEntry.queriedText.parameterTransformationFn(breadcrumb.param, route.params[breadcrumb.param.replace(/^:/, '')] as string);
            switch (replacementMapEntry.queriedText.query) {
              case ':catalog':
                catalogQueryParameters.value = transformedParameters;
                break;
              case ':domain':
                domainQueryParameters.value = transformedParameters;
                break;
              case ':subType':
                subTypeQueryParameters.value = transformedParameters;
                break;
              case ':objectType':
                objectTypeQueryParameters.value = transformedParameters;
                break;
              case ':object':
                objectQueryParameters.value = transformedParameters;
                break;
            }
          }
        }
      },
      {
        immediate: true
      }
    );

    // Page title related stuff
    const updateTitle = () => {
      if (props.writeToTitle) {
        title.value = breadcrumbs.value
          .map((entry) => (BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(entry.param)?.queriedText ? queryResultMap.value[entry.param as SupportedQuery] : entry.text))
          .reverse()
          .slice(0, BREADCRUMB_BREAKOFF)
          .join(' - ');
      }
    };


    watch(() => locale.value, updateTitle, { immediate: true });
    watch(() => queryResultMap, updateTitle, { deep: true, immediate: true });
    watch(() => breadcrumbs.value, updateTitle, { deep: true, immediate: true });

    return {
      queryResultMap,
      breadcrumbs,
      BREADCRUMB_BREAKOFF,
      displayedBreadcrumbs,
      slicedBreadcrumbs,

      t,
      mdiChevronRight,
      mdiDotsHorizontal,
      omit
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "all": "All"
  },
  "de": {
    "all": "Alle"
  }
}
</i18n>

<style lang="scss" scoped>
a.v-breadcrumbs-item:not(:last-child) {
  color: $primary
}

.v-breadcrumbs-item .v-icon {
    font-size: 1.4rem;
}

.breadcrumbs-item-height {
  height: 1.4rem;
}
</style>
