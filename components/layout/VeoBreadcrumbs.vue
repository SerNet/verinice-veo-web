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
          <template v-if="item.asyncText">
            <template v-if="asyncTextMap[item.param]">
              {{ asyncTextMap[item.param] }}
            </template>
            <v-skeleton-loader
              v-else
              type="image"
              width="80"
              height="14"
            />
          </template>
        
          <template v-if="item.text">
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
                    <v-list-item-title>
                      <template v-if="menuItem.asyncText">
                        <template v-if="asyncTextMap[menuItem.param]">
                          {{ asyncTextMap[menuItem.param] }}
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
import { defineComponent, del, useRoute, useContext, PropType, computed, ComputedRef, watch, set, reactive } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { last } from 'lodash';
import { mdiChevronRight, mdiDotsHorizontal, mdiHomeOutline } from '@mdi/js';
import { separateUUIDParam } from '~/lib/utils';

export interface IVeoBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  key: string;
  to: string;
  text?: string;
  asyncText?: (param: string, value?: string) => Promise<string>;
  icon?: any;
  position: number;
  index: number;
  param: string;
}

interface IVeoBreadcrumbReplacementMapBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  to?: string | Function;
  text?: string;
  asyncText?: (param: string, value?: string) => Promise<string>;
  icon?: any;
  position?: number;
  hidden?: boolean;
}

export default defineComponent({
  props: {
    customBreadcrumbs: {
      type: Array as PropType<IVeoBreadcrumb[]>,
      default: () => []
    },
    overrideBreadcrumbs: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { $api } = useContext();

    // After this position, all breadcrumbs will be moved to a menu to avoid scrolling
    const BREADCRUMB_BREAKOFF = 4;

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
          icon: mdiHomeOutline
        }
      ],
      [
        ':type', // Used for reports
        {
          asyncText: async (_param, value) => {
            const reports = await $api.report.fetchAll();
            return reports[value as string].name[locale.value];
          }
        }
      ],
      [
        ':entity',
        {
          asyncText: async (_param, value) => {
            const { type, id } = separateUUIDParam(value);
            const object = await $api.entity.fetch(type, id);
            return object.displayName;
          }
        }
      ],
      [
        ':catalog',
        {
          asyncText: async (_param, value) => {
            const { id } = separateUUIDParam(value);
            const catalog = await $api.catalog.fetch(id);
            return catalog.name;
          }
        }
      ],
      [
        ':matrix',
        {
          asyncText: (_param, value) => {
            return Promise.resolve(value as string);
          }
        }
      ],
      [
        'objects',
        {
          to: () => {
            const objectType = separateUUIDParam(route.value.params.entity).type;

            return `/${route.value.params.unit}/domains/${route.value.params.domain}/objects?objectType=${objectType.length ? objectType : route.value.query.objectType}`;
          }
        }
      ]
    ]);

    const pathTemplate = computed(() => last(route.value.matched)?.path || '');

    const breadcrumbParts = computed(() => pathTemplate.value.split('/'));

    const generatedBreadcrumbs: ComputedRef<(IVeoBreadcrumb & { loading?: boolean })[]> = computed(() =>
      breadcrumbParts.value
        .filter((part) => !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(part) || !BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part)?.hidden)
        .map((part, index) => {
          const replacementMapEntry = BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part);

          return {
            param: part,
            exact: true,
            text: ['text', 'icon', 'asyncText'].some((key) => key in (replacementMapEntry || {})) ? undefined : t(`breadcrumbs.${part}`).toString(),
            index,
            key: breadcrumbParts.value.slice(0, breadcrumbParts.value.findIndex((_part) => _part === part) + 1).join('/') || '/',
            position: index * 10,
            ...(replacementMapEntry || {}),
            to: replacementMapEntry?.to
              ? typeof replacementMapEntry.to === 'string'
                ? replacementMapEntry.to
                : replacementMapEntry.to()
              : route.value.fullPath
                  .split('/')
                  .slice(0, breadcrumbParts.value.findIndex((_part) => _part === part) + 1)
                  .join('/') || '/'
          };
        })
    );

    const breadcrumbs = computed(() =>
      props.overrideBreadcrumbs
        ? props.customBreadcrumbs
        : [...generatedBreadcrumbs.value, ...props.customBreadcrumbs].sort((breadcrumbA, breadcrumbB) => breadcrumbA.position - breadcrumbB.position)
    );

    const displayedBreadcrumbs = computed(() => breadcrumbs.value.slice(0, BREADCRUMB_BREAKOFF + 1)); // Use one breadcrumb more than would be displayed to display the "more"-button
    const slicedBreadcrumbs = computed(() => breadcrumbs.value.slice(BREADCRUMB_BREAKOFF + 1)); // Start with the breadcrumb that wouldn't be displayed

    // Async text results
    const asyncTextMap = reactive<{ [param: string]: string }>({});
    watch(
      () => breadcrumbs.value,
      async (newValue) => {
        for (const breadcrumb of newValue) {
          if (breadcrumb.asyncText) {
            try {
              del(asyncTextMap, breadcrumb.param);
              const result = await breadcrumb.asyncText(breadcrumb.param, route.value.params[breadcrumb.param.replace(/^:/, '')]);
              set(asyncTextMap, breadcrumb.param, result);
            } catch (e: any) {
              // eslint-disable-next-line no-console
              console.warn(`Couldn't fetch async text for breadcrumb ${breadcrumb.param}: ${e.message}`);
            }
          }
        }
      },
      {
        immediate: true
      }
    );

    return {
      asyncTextMap,
      breadcrumbs,
      BREADCRUMB_BREAKOFF,
      displayedBreadcrumbs,
      slicedBreadcrumbs,

      t,
      mdiChevronRight,
      mdiDotsHorizontal
    };
  }
});
</script>
