<!--
   - verinice.veo web
   - Copyright (C) 2022 Jessica Lühnen, Jonas Heitmann
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
  <v-row class="fill-height flex-column flex-nowrap">
    <v-col class="flex-grow-0">
      <template v-if="!loading">
        <p class="text-no-wrap mb-0">
          <strong>{{ upperFirst(t('updatedAt').toString()) }}:</strong>
          {{ object && formatDateTime(object.updatedAt) || '-' }} {{ t('by') }} {{ object && object.updatedBy || '-' }}
        </p>
        <p class="text-no-wrap mb-0">
          <strong>{{ upperFirst(t('createdAt').toString()) }}:</strong>
          {{ object && formatDateTime(object.createdAt) || '-' }} {{ t('by') }} {{ object && object.createdBy || '-' }}
        </p>
      </template>
      <v-skeleton-loader
        v-else
        type="text@2"
        width="60%"
      />
    </v-col>
    <v-col
      v-if="!loading"
      class="flex-grow-0 object-details-information"
    >
      <span v-if="object && object.description">{{ object.description }}</span>
      <i v-else>{{ t('noDescription') }}</i>
    </v-col>
    <v-col
      v-else
      class="flex-grow-0 object-details-information"
    >
      <v-skeleton-loader type="paragraph" />
    </v-col>
    <v-divider class="mt-1" />
    <v-col>
      <v-tabs
        :value="activeTab"
        @change="$emit('update:activeTab', $event)"
      >
        <!-- We use v-show instead of v-if, as v-show doesn't cause side effects in the v-model if risks are not present -->
        <v-tab
          v-for="tab in tabs"
          v-show="tab !== 'risks' || (loading || subType === 'PRO_DataProcessing')"
          :key="tab"
          :href="`#${tab}`"
          :disabled="tab === 'parents'"
        >
          {{ t(tab) }}
        </v-tab>
      </v-tabs>
      <v-tabs-items :value="activeTab">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab"
          :value="tab"
        >
          <VeoObjectDetailsTab
            v-if="object"
            :type="tab"
            :object="object"
            :dense="dense"
            :domain-id="domainId"
            @new-object-created="$emit('reload')"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { mdiChevronDown } from '@mdi/js';

import { IVeoEntity } from '~/types/VeoTypes';
import { formatDate, formatTime } from '~/lib/utils';

export default defineComponent({
  name: 'VeoObjectDetails',
  props: {
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>,
    loading: {
      type: Boolean,
      default: false
    },
    activeTab: {
      type: String,
      default: 'subEntities'
    },
    domainId: {
      type: String,
      required: true
    },
    dense: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const tabs = ['subEntities', 'parents', 'links', 'risks'];

    const subType = computed(() => props.object?.domains[props.domainId]?.subType);

    // If the user accessed the object in the risks tab but the object doesn't have the subType data processing, force another tab
    watch(
      () => props.loading,
      (newValue, previousValue) => {
        if (previousValue && !newValue && subType.value !== 'PRO_DataProcessing' && props.activeTab === 'risks') {
          emit('update:activeTab', 'subEntities');
        }
      }
    );

    // format date time to show updated at & created at
    const formatDateTime = (date: string) => formatDate(new Date(date)) + ' ' + formatTime(new Date(date));

    return {
      subType,
      tabs,

      mdiChevronDown,
      formatDateTime,
      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "by": "by",
    "createdAt": "created",
    "links": "links",
    "noDescription": "No description provided",
    "parents": "part of",
    "risks": "risks",
    "subEntities": "parts",
    "updatedAt": "last change"
  },
  "de": {
    "by": "von",
    "createdAt": "erstellt",
    "links": "links",
    "noDescription": "Keine Beschreibung vorhanden",
    "parents": "teil von",
    "risks": "Risiken",
    "subEntities": "bestandteile",
    "updatedAt": "letzte Änderung"
  }
}
</i18n>

<style lang="scss" scoped>
.object-details-information {
  min-height: 16vh;
  max-height: 50vh;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
