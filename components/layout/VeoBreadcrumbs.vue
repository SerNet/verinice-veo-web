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
  <v-breadcrumbs
    :items="displayedBreadcrumbs"
    class="px-0"
    data-component-name="breadcrumbs"
  >
    <template #item="{ item }">
      <v-breadcrumbs-item
        v-bind="item"
        nuxt
      >
        <!-- Display if the breadcrumb is visible or the amount of breadcrumbs is one over the BREADCRUMB_BREAKOFF (else there would be a single item in the list, making it kinda pointless) -->
        <template v-if="item.index < BREADCRUMB_BREAKOFF || breadcrumbs.length === BREADCRUMB_BREAKOFF + 1">
          <v-icon
            v-if="item.icon"
            class="primary--text"
          >
            {{ item.icon }}
          </v-icon>
          <template v-else-if="Object.keys(queryResultMap).includes(item.param)">
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
          <template v-else-if="item.text">
            {{ item.text }}
          </template>
        </template>
        <!-- Display the button with the list instead the last item -->
        <template v-else-if="item.index === BREADCRUMB_BREAKOFF">
          <v-menu
            bottom
            offset-y
          >
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click.stop.prevent
              >
                <v-icon color="primary">
                  {{ mdiDotsHorizontal }}
                </v-icon>
              </v-btn>
            </template>
            <template #default>
              <v-list dense>
                <v-list-item-group
                  mandatory
                  color="primary"
                >
                  <v-list-item
                    v-for="menuItem of slicedBreadcrumbs"
                    v-bind="menuItem"
                    :key="menuItem.key"
                    nuxt
                  >
                    <v-list-item-icon v-if="menuItem.icon">
                      <v-icon
            
                        class="primary--text"
                      >
                        {{ menuItem.icon }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title v-else>
                      <template v-if="Object.keys(queryResultMap).includes(menuItem.param)">
                        <template v-if="queryResultMap[menuItem.param]">
                          {{ queryResultMap[menuItem.param] }}
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
                </v-list-item-group>
              </v-list>
            </template>
          </v-menu>
        </template>
      </v-breadcrumbs-item>
    </template>
    <template #divider>
      <v-icon
        color="black"
        small
      >
        {{ mdiChevronRight }}
      </v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { defineComponent, useRoute, computed, ComputedRef, watch, useMeta, ref, reactive, set } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { isEmpty, last, pick } from 'lodash';
import { mdiChevronRight, mdiDotsHorizontal, mdiHomeOutline } from '@mdi/js';

import { IVeoBreadcrumb, useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { useFetchSchemas } from '~/composables/api/schemas';
import { useFetchObject } from '~/composables/api/objects';
import { useFetchDomain } from '~/composables/api/domains';
import { useFetchReports } from '~/composables/api/reports';
import { useFetchCatalog } from '~/composables/api/catalogs';

type SupportedQuery = ':domain' | ':entity' | ':type' | ':catalog';

interface IVeoBreadcrumbReplacementMapBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  hidden?: boolean;
  icon?: any;
  to?: string | Function;
  dynamicText?: (param: string, value?: string) => string;
  queriedText?: {
    query: SupportedQuery;
    parameterTransformationFn: (param: string, value?: string) => {};
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
    const { title } = useMeta();
    const { breadcrumbs: customBreadcrumbs } = useVeoBreadcrumbs();

    const { data: endpoints } = useFetchSchemas();

    const BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP = new Map<string, IVeoBreadcrumbReplacementMapBreadcrumb>([
      [
        '',
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
            parameterTransformationFn: (_param, value) => ({ id: separateUUIDParam(value).id }),
            resultTransformationFn: (_param, _value, data) => data.name
          }
        }
      ],
      [
        ':type', // Used for reports
        {
          queriedText: {
            query: ':type',
            parameterTransformationFn: (_param, _value) => ({}),
            resultTransformationFn: (_param, value, data) => data[value as string].name[locale.value]
          }
        }
      ],
      [
        ':entity',
        {
          queriedText: {
            query: ':entity',
            parameterTransformationFn: (_param, value) => {
              const { type: objectType, id } = separateUUIDParam(value);
              return { objectType, id };
            },
            resultTransformationFn: (_param, _value, data) => data.displayName
          }
        }
      ],
      [
        ':catalog',
        {
          queriedText: {
            query: ':catalog',
            parameterTransformationFn: (_param, value) => ({ id: separateUUIDParam(value).id }),
            resultTransformationFn: (_param, _value, data) => data.name
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
        'objects',
        {
          to: () => {
            const objectType = endpoints.value?.[separateUUIDParam(route.value.params.entity).type];

            return `/${route.value.params.unit}/domains/${route.value.params.domain}/objects?objectType=${objectType}`;
          }
        }
      ],
      [
        'docs',
        {
          to: '/docs/index'
        }
      ],
      [
        '*',
        {
          hidden: true
        }
      ]
    ]);

    // After this position, all breadcrumbs will be moved to a menu to avoid scrolling
    const BREADCRUMB_BREAKOFF = 4;

    // Queried text. For now we assume that every query type will only be used once (at most one object, one domain, one report is part of the path).
    // Must be refactored if for example two objects are part of the path.
    const queryResultMap = reactive<{ [K in SupportedQuery]: any }>({
      ':domain': undefined,
      ':entity': undefined,
      ':type': undefined,
      ':catalog': undefined
    });

    const successFunction = (key: SupportedQuery) => (data: any) =>
      set(queryResultMap, key, BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(key)?.queriedText?.resultTransformationFn(key, route.value.params[key], data));

    const objectQueryParameters = ref<any>({});
    const objectQueryEnabled = computed(() => !isEmpty(objectQueryParameters.value));
    useFetchObject(objectQueryParameters, {
      enabled: objectQueryEnabled,
      onSuccess: successFunction(':entity')
    });
    const domainQueryParameters = ref<any>({});
    const domainQueryEnabled = computed(() => !isEmpty(domainQueryParameters.value));
    useFetchDomain(domainQueryParameters, {
      enabled: domainQueryEnabled,
      onSuccess: successFunction(':domain')
    });
    const catalogQueryParameters = ref<any>({});
    const catalogQueryEnabled = computed(() => !isEmpty(catalogQueryParameters.value));
    useFetchCatalog(catalogQueryParameters, {
      enabled: catalogQueryEnabled,
      onSuccess: successFunction(':catalog')
    });
    useFetchReports({
      onSuccess: successFunction(':type')
    });

    const pathTemplate = computed(() => last(route.value.matched)?.path || '');

    const breadcrumbParts = computed(() => pathTemplate.value.split('/'));

    const generatedBreadcrumbs: ComputedRef<IVeoBreadcrumb[]> = computed(() =>
      breadcrumbParts.value
        .filter((part) => !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(part) || !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part)?.hidden)
        .map((part, index) => {
          const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part) || {};

          return {
            param: part,
            exact: true,
            text: ['text', 'icon', 'queriedText', 'dynamicText'].some((key) => key in replacementMapEntry) ? undefined : t(`breadcrumbs.${part}`).toString(),
            index,
            key: breadcrumbParts.value.slice(0, breadcrumbParts.value.findIndex((_part) => _part === part) + 1).join('/') || '/',
            position: index * 10,
            ...pick(replacementMapEntry, ['disabled', 'exact', 'hidden', 'icon', 'position', 'text']),
            to: replacementMapEntry.to
              ? typeof replacementMapEntry.to === 'string'
                ? replacementMapEntry.to
                : replacementMapEntry.to()
              : route.value.fullPath
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
              text: replacementMapEntry.dynamicText(breadcrumb.param, route.value.params[breadcrumb.param])
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
            const transformedResult = replacementMapEntry.queriedText.parameterTransformationFn(breadcrumb.param, route.value.params[breadcrumb.param.replace(/^:/, '')]);
            switch (replacementMapEntry.queriedText.query) {
              case ':catalog':
                catalogQueryParameters.value = transformedResult;
                break;
              case ':domain':
                domainQueryParameters.value = transformedResult;
                break;
              case ':entity':
                objectQueryParameters.value = transformedResult;
                break;
            }
          }
        }
      },
      {
        immediate: true
      }
    );

    // console.warn(`Couldn't fetch async text for breadcrumb ${breadcrumb.param}: ${e.message}`);

    // Page title related stuff
    const updateTitle = () => {
      if (props.writeToTitle) {
        title.value = breadcrumbs.value
          .map((entry) => (BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(entry.param) ? queryResultMap[entry.param as SupportedQuery] : entry.text))
          .reverse()
          .slice(0, BREADCRUMB_BREAKOFF)
          .join(' - ');
      }
    };

    watch(() => queryResultMap, updateTitle, { deep: true, immediate: true });
    watch(() => breadcrumbs.value, updateTitle, { deep: true, immediate: true });

    return {
      queryResultMap: queryResultMap as IBaseObject, // We can't typify in the template so to avoid typing errors getting thrown there, we make the type more generic
      breadcrumbs,
      BREADCRUMB_BREAKOFF,
      displayedBreadcrumbs,
      slicedBreadcrumbs,

      t,
      mdiChevronRight,
      mdiDotsHorizontal
    };
  },
  head: {}
});
</script>
