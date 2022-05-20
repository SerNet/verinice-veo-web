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
    :items="breadcrumbs"
    class="px-0"
    data-component-name="breadcrumbs"
  >
    <template #item="{ item }">
      <v-breadcrumbs-item
        v-bind="attrs"
        nuxt
      >
        {{ item.to }}
        <v-icon
          v-if="item.icon"
          small
          class="primary--text"
        >
          {{ item.icon }}
        </v-icon>
        <v-skeleton-loader
          v-if="item.asyncText"
          type="image"
          width="60"
          height="14"
        />
        <template v-if="item.text">
          {{ item.text }}
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
import { defineComponent, useRoute, useContext, PropType, computed, ComputedRef } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { last } from 'lodash';
import { mdiChevronRight, mdiHomeOutline } from '@mdi/js';
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
}

interface IVeoBreadcrumbReplacementMapBreadcrumb {
  disabled?: boolean;
  exact?: boolean;
  to?: string;
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
    const BREADCRUMB_BREAKOFF = 6;

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
          asyncText: async (_param, value) => {
            const unitId = separateUUIDParam(value).id;
            const unit = await $api.unit.fetch(unitId);
            return unit.name;
          },
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
      ]
    ]);

    const pathTemplate = computed(() => last(route.value.matched)?.path || '');

    const breadcrumbParts = computed(() => pathTemplate.value.split('/'));

    const generatedBreadcrumbs: ComputedRef<(IVeoBreadcrumb & { loading?: boolean })[]> = computed(() =>
      breadcrumbParts.value
        .map((part, index) => ({
          text: ['text', 'icon', 'asyncText'].some((key) => key in (BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part) || {})) ? undefined : t(`breadcrumbs.${part}`).toString(),
          index,
          key: breadcrumbParts.value.slice(0, index + 1).join('/') || '/',
          to:
            route.value.fullPath
              .split('/')
              .slice(0, index + 1)
              .join('/') || '/',
          position: index * 10,
          ...(BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.has(part) ? BREADCRUMB_CUSTOMIZED_REPLACEMENT_MAP.get(part) : {})
        }))
        .filter((breadcrumb) => !breadcrumb.hidden === true)
    );

    console.log(generatedBreadcrumbs);

    const breadcrumbs = computed(() =>
      props.overrideBreadcrumbs
        ? props.customBreadcrumbs
        : [...generatedBreadcrumbs.value, ...props.customBreadcrumbs].sort((breadcrumbA, breadcrumbB) => breadcrumbA.position - breadcrumbB.position)
    );

    return {
      BREADCRUMB_BREAKOFF,
      breadcrumbs,

      t,
      mdiChevronRight
    };
  }
});
</script>
