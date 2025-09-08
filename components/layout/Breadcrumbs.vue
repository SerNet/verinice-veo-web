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
  <div class="crumbs" data-component-name="breadcrumbs" data-veo-test="breadcrumbs">
    <v-breadcrumbs>
      <!-- Breadcrumbs hidden in a ... menu -->
      <template v-if="menuCrumbs">
        <li class="crumb__menu">
          <v-menu v-if="true">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                :icon="mdiDotsHorizontal"
                :aria-label="t('showBreadcrumbs')"
                small
                @click.stop.prevent
              />
            </template>
            <template #default>
              <ul class="crumb__menu__list v-list">
                <template v-for="item in menuCrumbs" :key="item.key">
                  <Crumb :item="item" />
                </template>
              </ul>
            </template>
          </v-menu>
          <span>
            <v-icon :icon="mdiChevronRight" size="small" />
          </span>
        </li>
      </template>

      <!-- Always visible crumbs -->
      <template v-if="visibleCrumbs">
        <template v-for="(item, index) in visibleCrumbs" :key="item.index">
          <Crumb :item="item" :has-chevron="index != visibleCrumbs.length - 1" />
        </template>
      </template>
    </v-breadcrumbs>
  </div>
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
import { truncate } from 'lodash';
import { useDisplay } from 'vuetify';
import type { TInlineComponent } from '~/types/utils';

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
const { data: translations } = useTranslations();
// Breakpoints
const { mdAndDown, smAndDown, xs } = useDisplay();

// Max length of breadcrumbs before
const BREADCRUMB_BREAKOFF = computed(() => {
  if (xs.value) return 6;
  if (smAndDown.value) return 4;
  if (mdAndDown.value) return 0;
  return 0;
});

const truncateAt = computed(() => {
  if (xs.value) return 26;
  return 22;
});

const numberOfVisibleCrumbs = computed(() =>
  xs.value ? -10
  : smAndDown.value ? 1
  : 2
);

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
    ':definition',
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

// remove index 0 + 1 from breadcrumbs
const menuCrumbs = computed(() => {
  if (BREADCRUMB_BREAKOFF.value > 0 || breadcrumbs.value.length > 3) {
    return JSON.parse(JSON.stringify(breadcrumbs.value)).slice(
      0,
      breadcrumbs.value.length - numberOfVisibleCrumbs.value
    );
  }
  return null;
});

const visibleCrumbs = computed(() => {
  if (BREADCRUMB_BREAKOFF.value > 0 || breadcrumbs.value.length > 3) {
    return JSON.parse(JSON.stringify(breadcrumbs.value)).slice(-numberOfVisibleCrumbs.value);
  }
  return JSON.parse(JSON.stringify(breadcrumbs.value));
});

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

// Page title
const updateTitle = () => {
  if (props.writeToTitle) {
    title.value = breadcrumbs.value
      .map((entry) =>
        BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(entry.param)?.queriedText ?
          queryResultMap.value[entry.param as SupportedQuery]
        : entry.text
      )
      .reverse()
      .slice(0, 5)
      .join(' - ');
  }
};

watch(() => locale.value, updateTitle, { immediate: true });
watch(queryResultMap, updateTitle, { immediate: true });
watch(breadcrumbs, updateTitle, { immediate: true });

const Crumb: TInlineComponent = {
  props: ['item', 'hasChevron'],
  data: () => ({
    mdiChevronRight,
    route,
    BREADCRUMB_BREAKOFF,
    queryResultMap,
    truncate,
    truncateAt
  }),
  methods: {
    getBreadcrumbText({ item, queryResultMap }) {
      if (!item) return;
      if (Object.keys(queryResultMap).includes(item?.param)) return queryResultMap?.[item?.param];
      return item?.text as string;
    }
  },
  computed: {
    breadcrumbText() {
      return this.getBreadcrumbText({ item: this.item, queryResultMap: this.queryResultMap });
    }
  },

  template: `
    <v-breadcrumbs-item>
      <v-tooltip :text="breadcrumbText" :aria-label="breadcrumbText">
        <template v-slot:activator="{ props }">
        <span v-bind="props">
          <RouterLink
            :data-veo-test="item?.dataVeoTest ?? 'breadcrumb-item'"
            :disabled="item.disabled || item.to === route.fullPath"
            :to="item.to"
            :aria-label="breadcrumbText"
            class="crumb__link"

          >

          <div class="crumb__inner">
            <v-icon v-if="item.icon" class="text-primary" :icon="item.icon" size="large" />

            <span v-if="breadcrumbText" class="crumb__name breadcrumbs-item-height small-caps capitalize">
              {{ truncate( breadcrumbText , {length: truncateAt}) }}
            </span>

            <v-skeleton-loader v-if="!breadcrumbText && !item.icon" data-veo-test="loader" type="list-item"/>

            <span v-if="hasChevron">
              <v-icon :icon="mdiChevronRight" size="small" />
            </span>
          </div>

        </RouterLink>
      </span>
      </template>
    </v-tooltip>
  </v-breadcrumbs-item>
  `
};
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

:deep(.crumb__menu__list) {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 2px;
  gap: 8px;
  cursor: pointer;
}

:deep(.v-overlay__content a:not([disabled='true'])) {
  cursor: pointer;
}
:deep(.v-breadcrumbs-item a[disabled='true']) {
  opacity: var(--v-disabled-opacity);
}

:deep(.crumb__inner) {
  display: flex;
  align-items: center;
  gap: 8px;

  .v-skeleton-loader {
    width: 80px;
  }

  @media (max-width: 620px) {
    .v-skeleton-loader {
      width: 10px;
    }
  }
}

:deep(.crumb__menu) {
  display: flex;
  align-items: center;
}

.crumbs {
  display: flex;
  align-items: center;
}

:deep(.crumb__link) {
  text-decoration: none;
  color: rgb(var(--v-theme-on-basepage));
  cursor: pointer;
  opacity: var(--v-disabled-opacity) !important;

  &[disabled='true'] {
    pointer-events: none; //disable clicking on the current breadcrumb
    opacity: 1 !important;
    color: rgb(var(--v-theme-on-basepage));
  }
}

@media (max-width: 520px) {
  .crumbs {
    display: none;
  }
}
</style>
