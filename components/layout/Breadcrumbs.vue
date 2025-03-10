<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann, Samuel Vitzthum, Frank Schneider
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
  <v-breadcrumbs
    class="text-h3"
    data-component-name="breadcrumbs"
    data-veo-test="breadcrumbs"
  >
    <v-breadcrumbs-item
      v-for="(item, index) of displayedBreadcrumbs"
      :key="item.key"
      :data-veo-test="item.dataVeoTest ?? 'breadcrumb-item'"
      :disabled="item.disabled || (item.to === route.fullPath && item.index < BREADCRUMB_BREAKOFF)"
      :to="item.to"
      nuxt
    >
      <span v-if="index > 0 && (queryResultMap[item.param] || item.text)">
        <v-icon :icon="mdiChevronRight" size="small" />
      </span>
      <!-- Display if the breadcrumb is visible or the amount of breadcrumbs is bigger than BREADCRUMB_BREAKOFF -->
      <template v-if="item.index < BREADCRUMB_BREAKOFF || breadcrumbs.length === BREADCRUMB_BREAKOFF + 1">
        <v-icon v-if="item.icon" class="text-primary" :icon="item.icon" size="large" />
        <span
          v-else-if="Object.keys(queryResultMap).includes(item.param)"
          class="breadcrumbs-item-height small-caps capitalize"
        >
          <template v-if="queryResultMap[item.param]">
            {{ queryResultMap[item.param] }}
          </template>
          <v-skeleton-loader v-else data-veo-test="loader" type="text" />
        </span>
        <span v-else-if="item.text" class="breadcrumbs-item-height small-caps capitalize">
          {{ item.text }}
        </span>
      </template>
      <!-- Display the button with the list instead of the last item -->
      <template v-else-if="item.index === BREADCRUMB_BREAKOFF">
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" color="primary" :icon="mdiDotsHorizontal" small @click.stop.prevent />
          </template>
          <template #default>
            <v-list dense>
              <v-list-item v-for="menuItem of slicedBreadcrumbs" :key="menuItem.key" nuxt>
                <v-breadcrumbs-item
                  :key="menuItem.key"
                  :disabled="menuItem.disabled || menuItem.to === route.fullPath"
                  :to="menuItem.to"
                  nuxt
                >
                  <!-- @vue-ignore TODO #3099 property does not exist-->
                  <template v-if="menuItem.icon" #prepend>
                    <v-icon :icon="menuItem.icon" color="primary" size="large" />
                  </template>
                  <v-list-item-title v-if="!menuItem.icon">
                    <template v-if="Object.keys(queryResultMap).includes(menuItem.param)">
                      <template v-if="queryResultMap[menuItem.param]">
                        {{ queryResultMap[menuItem.param] }}
                      </template>
                      <v-skeleton-loader v-else data-veo-test="loader" type="text" />
                    </template>
                    <template v-if="menuItem.text">
                      {{ menuItem.text }}
                    </template>
                  </v-list-item-title>
                </v-breadcrumbs-item>
              </v-list-item>
            </v-list>
          </template>
        </v-menu>
      </template>
    </v-breadcrumbs-item>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { isEmpty, last, pick } from 'lodash';
import { mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';

import { IVeoBreadcrumb, useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';

import { useQuery } from '~/composables/api/utils/query';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import objectsQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useSubTypeTranslation, useTranslations } from '~/composables/Translations';

type SupportedQuery = ':unit' | ':domain' | ':report' | ':objectType' | ':object';

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

const props = defineProps<{
  overrideBreadcrumbs?: boolean;
  writeToTitle?: boolean;
}>();

const { t, locale } = useI18n();
const route = useRoute();
const { isOverridingBreadcrumbs, breadcrumbs: customBreadcrumbs } = useVeoBreadcrumbs();
const { subTypeTranslation } = useSubTypeTranslation();
const { data: translations } = useTranslations({ domain: route.params.domain as string });

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
      disabled: true,
      hidden: false,
      queriedText: {
        query: ':unit',
        parameterTransformationFn: (_param, value) => ({ id: value }),
        resultTransformationFn: (_param, _value, data) => data.name
      }
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
      queriedText: {
        query: ':domain',
        parameterTransformationFn: (_param, value) => ({ id: value }),
        resultTransformationFn: (_param, _value, data) => data.abbreviation
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
      dynamicText: (_param, _value) => (unref(subTypeTranslation) === 'all' ? t('all') : unref(subTypeTranslation))
    }
  ],
  [
    ':object',
    {
      queriedText: {
        query: ':object',
        parameterTransformationFn: () => ({
          id: route.params.object,
          endpoint: route.params.objectType
        }),
        resultTransformationFn: (_param, _value, data) => data.displayName
      }
    }
  ],
  [
    ':report',
    {
      queriedText: {
        query: ':report',
        parameterTransformationFn: (_param, _value) => ({}),
        resultTransformationFn: (_param, value, data) =>
          data ? data[value as string]?.name?.[locale.value] : undefined
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
    ':slug(.*)*', // Doc page gets added manually to breadcrumbs
    {
      hidden: true
    }
  ]
]);

// After this position, all breadcrumbs will be moved to a menu to avoid scrolling
const BREADCRUMB_BREAKOFF = 5;

// Queried text. For now we assume that every query type will only be used once (at most one object, one domain, one report is part of the path).
// Must be refactored if for example two objects are part of the path.
const unitQueryParameters = ref<any>({});
const unitQueryEnabled = computed(() => !isEmpty(unitQueryParameters.value));
const { data: unit } = useQuery(unitQueryDefinitions.queries.fetch, unitQueryParameters, {
  enabled: unitQueryEnabled
});

const domainQueryParameters = ref<any>({});
const domainQueryEnabled = computed(() => !isEmpty(domainQueryParameters.value));
const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, domainQueryParameters, {
  enabled: domainQueryEnabled
});

const objectQueryParameters = ref<any>({});
const objectQueryEnabled = computed(() => !isEmpty(objectQueryParameters.value));
const { data: object } = useQuery(objectsQueryDefinitions.queries.fetch, objectQueryParameters, {
  enabled: objectQueryEnabled
});

const { data: report } = useQuery(reportQueryDefinitions.queries.fetchAll);

const queryResultMap = computed<{ [key: string]: any }>(() => ({
  ':domain':
    domain.value ?
      BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':domain')?.queriedText?.resultTransformationFn(
        ':domain',
        route.params.domain as string,
        domain.value
      )
    : undefined,
  ':objectType':
    translations.value ?
      BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':objectType')?.queriedText?.resultTransformationFn(
        ':objectType',
        route.params.objectType as string,
        translations.value
      )
    : undefined,
  ':object':
    object.value ?
      BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':object')?.queriedText?.resultTransformationFn(
        ':object',
        route.params.object as string,
        object.value
      )
    : undefined,
  ':report':
    report.value ?
      BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':report')?.queriedText?.resultTransformationFn(
        ':report',
        route.params.report as string,
        report.value
      )
    : undefined,
  ':unit':
    unit.value ?
      BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(':unit')?.queriedText?.resultTransformationFn(
        ':unit',
        route.params.unit as string,
        unit.value
      )
    : undefined
}));

const pathTemplate = computed(() => last(route.matched)?.path || '');

const breadcrumbParts = computed(() => pathTemplate.value.replaceAll('()', '').split('/'));

const generatedBreadcrumbs = computed<IVeoBreadcrumb[]>(() => generateBreadcrumbs(breadcrumbParts.value));

function generateBreadcrumbs(breadcrumbParts: string[]): IVeoBreadcrumb[] {
  return breadcrumbParts
    .filter(
      (part) =>
        !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(part) || !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part)?.hidden
    )
    .map((part, index) => {
      const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part) || {};

      return {
        param: part,
        exact: true,
        text:
          ['text', 'icon', 'queriedText', 'dynamicText'].some((key) => key in replacementMapEntry) ? undefined : (
            t(`breadcrumbs.${part}`)
          ),
        index,
        key: breadcrumbParts.slice(0, breadcrumbParts.findIndex((_part) => _part === part) + 1).join('/') || '/',
        position: index * 10,
        ...pick(replacementMapEntry, ['disabled', 'exact', 'hidden', 'icon', 'position', 'text']),
        to:
          replacementMapEntry.to ?
            typeof replacementMapEntry.to === 'string' ?
              replacementMapEntry.to
            : replacementMapEntry.to()
          : route.fullPath
              .split('/')
              .slice(0, breadcrumbParts.findIndex((_part) => _part === part) + 1)
              .join('/') || '/'
      };
    })
    .map((breadcrumb) => {
      const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(breadcrumb.param) || {};
      if (replacementMapEntry?.dynamicText) {
        return {
          ...breadcrumb,
          text: replacementMapEntry.dynamicText(
            breadcrumb.param,
            route.params[breadcrumb.param.replace(/^:/, '')] as string
          )
        };
      } else {
        return breadcrumb;
      }
    });
}

const breadcrumbs = computed(() => {
  let _breadcrumbs: IVeoBreadcrumb[] = [];

  if (!isOverridingBreadcrumbs.value) {
    _breadcrumbs = [...generatedBreadcrumbs.value];
  }

  for (const customBreadcrumb of customBreadcrumbs.value) {
    // Replace generated breadcrumb with custom breadcrumb:
    const index = customBreadcrumb?.indexToReplace;
    if (index && _breadcrumbs.length > index) {
      _breadcrumbs[index] = customBreadcrumb;
    }

    // Append custom breadcrumb:
    else {
      _breadcrumbs.push({ ...customBreadcrumb, index: _breadcrumbs.length });
    }
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
        const transformedParameters = replacementMapEntry.queriedText.parameterTransformationFn(
          breadcrumb.param,
          route.params[breadcrumb.param.replace(/^:/, '')] as string
        );
        switch (replacementMapEntry.queriedText.query) {
          case ':domain':
            domainQueryParameters.value = transformedParameters;
            break;
          case ':object':
            objectQueryParameters.value = transformedParameters;
            break;
          case ':unit':
            unitQueryParameters.value = transformedParameters;
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
      .map((entry) =>
        BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(entry.param)?.queriedText ?
          queryResultMap.value[entry.param as SupportedQuery]
        : entry.text
      )
      .reverse()
      .slice(0, BREADCRUMB_BREAKOFF)
      .join(' - ');
  }
};

watch(() => locale.value, updateTitle, { immediate: true });
watch(() => queryResultMap, updateTitle, { deep: true, immediate: true });
watch(() => breadcrumbs.value, updateTitle, { deep: true, immediate: true });
</script>

<i18n src="~/locales/base/components/layout-breadcrumbs.json"></i18n>

<style lang="scss" scoped>
:deep(.capitalize) {
  text-transform: capitalize;
}
.v-breadcrumbs-item .v-icon {
  font-size: 2rem;
}

.breadcrumbs-item-height {
  height: 2rem;
}
.v-breadcrumbs {
  padding: 0;
}
</style>
