<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum, Jessica Lühnen
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
  <!-- TODO: find a way to bind $attrs, so props don't need to be passed manually -->
  <VeoPage
:is-page-wrapper-child="isPageWrapperChild"
fullsize
sticky-header>
    <template #header>
      <v-row class="pb-4">
        <v-col cols="auto">
          <h3>{{ object && object.displayName }}</h3>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <div style="min-height: 16vh; max-height: 50vh; overflow-y: auto; overflow-x: hidden;">
        <v-row no-gutters>
          <v-col>
            <p class="text-no-wrap mb-0">
              <strong>{{ amountCustomAspects }}</strong>
              {{ upperFirst(t('customAspects').toString()) }}
            </p>
            <p class="text-no-wrap mb-0">
              <strong>{{ amountCustomLinks }}</strong>
              {{ upperFirst(t('customLinks').toString()) }}
            </p>
          </v-col>
          <v-col>
            <p
v-if="object"
class="text-xl-right text-no-wrap mb-0">
              <strong>{{ upperFirst(t('updatedAt').toString()) }}:</strong>
              {{ formatDateTime(object.updatedAt) }} {{ t('by') }} {{ object.updatedBy }}
            </p>
            <p
v-if="object"
class="text-xl-right text-no-wrap mb-0">
              <strong>{{ upperFirst(t('createdAt').toString()) }}:</strong>
              {{ formatDateTime(object.createdAt) }} {{ t('by') }} {{ object.createdBy }}
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>{{ object && object.description }}</v-col>
        </v-row>
      </div>
      <v-divider class="mt-1" />
      <v-row v-if="object">
        <v-col>
          <v-tabs v-model="activeTab">
            <v-tab
              v-for="tab in tabs"
              :key="tab"
              :href="`#${tab}`"
              :disabled="tab === 'parents'"
            >{{ t(tab) }}</v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeTab">
            <v-tab-item
v-for="tab in tabs"
:key="tab"
:value="tab">
              <VeoObjectDetailsTab
:type="tab"
:object="object"
:page-widths="pageWidths" 
@new-object-created="$emit('new-object-created')" />
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent, PropOptions, computed, useRouter, WritableComputedRef, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { IVeoEntity } from '~/types/VeoTypes';
import { formatDate, formatTime } from '~/lib/utils';

export default defineComponent({
  name: 'VeoObjectDetails',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>,
    isPageWrapperChild: {
      type: Boolean,
      default: false
    },
    pageWidths: {
      type: Array,
      default: () => []
    } as PropOptions<number[]>
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    // get amount of custom aspects and custom links
    const amountCustomAspects = computed(() => Object.keys(props.object?.customAspects || {}).length);
    const amountCustomLinks = computed(() => Object.keys(props.object?.links || {}).length);

    // format date time to show updated at & created at
    const formatDateTime = (date: string) => formatDate(new Date(date)) + ' ' + formatTime(new Date(date));

    // configure tabs to distinguish between subentities, parents and links
    const tabs = ['subEntities', 'parents', 'links'];

    // get active tab by route hash & set route hash by switching tabs
    const activeTab: WritableComputedRef<string> = computed({
      get(): string {
        return route.value.hash.substring(1) || 'subEntities'; // subEntities as default tab
      },
      set(hash: string): void {
        router.replace({ hash });
      }
    });

    return {
      amountCustomAspects,
      amountCustomLinks,
      formatDateTime,
      upperFirst,
      activeTab,
      tabs,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "customAspects": "custom aspects",
    "customLinks": "custom links",
    "updatedAt": "last change",
    "createdAt": "created",
    "by": "by",
    "subEntities": "subentities",
    "parents": "parents",
    "links": "links"
  },
  "de": {
    "customAspects": "Custom Aspects",
    "customLinks": "Custom Links",
    "updatedAt": "letzte Änderung",
    "createdAt": "erstellt",
    "by": "von",
    "subEntities": "Unterobjekte",
    "parents": "Eltern",
    "links": "Verlinkungen"
  }
}
</i18n>
