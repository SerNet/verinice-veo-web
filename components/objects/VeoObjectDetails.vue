<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
      <v-row>
        <v-col
          cols="auto"
          class="grow"
        >
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
          cols="auto"
          class="shrink"
        >
          <VeoNestedMenu :items="actions">
            <template
              #activator="{ on }"
            >
              <v-btn
                color="blue"
                text
                v-on="on"
              >
                Aktionen
                <v-icon right>
                  {{ mdiChevronDown }}
                </v-icon>
              </v-btn>
            </template>
          </VeoNestedMenu>
        </v-col>
      </v-row>
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
        <v-tab
          v-for="tab in tabs"
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
            @new-object-created="$emit('reload')"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { mdiChevronDown, mdiPlus, mdiLinkPlus } from '@mdi/js';
import { IVeoEntity, IVeoNestedMenuEntries } from '~/types/VeoTypes';
import { formatDate, formatTime } from '~/lib/utils';

export default defineComponent({
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
  setup(props) {
    const { t } = useI18n();

    const tabs = computed(() => ['subEntities', 'parents', 'links', ...(props.object?.domains[props.domainId]?.subType === 'PRO_DataProcessing' ? ['risks'] : [])]);

    // format date time to show updated at & created at
    const formatDateTime = (date: string) => formatDate(new Date(date)) + ' ' + formatTime(new Date(date));

    const actions = ref<IVeoNestedMenuEntries[]>([
      {
        title: 'Bestandteile...',
        key: 'subEntities',
        children: [
          {
            icon: mdiPlus,
            key: 'create-subentity-scope',
            title: 'Scope erstellen & hinzufügen',
            action: () => console.log('1')
          },
          {
            icon: mdiLinkPlus,
            key: 'add-subentity-scope',
            title: 'Scope hinzufügen',
            action: () => console.log('2')
          },
          {
            icon: mdiPlus,
            key: 'create-subentity-object',
            title: 'Objekt erstellen & hinzufügen',
            action: () => console.log('3')
          },
          {
            icon: mdiLinkPlus,
            key: 'add-subentity-object',
            title: 'Objekt hinzufügen',
            action: () => console.log('4')
          }
        ]
      },
      {
        title: 'Teil von...',
        key: 'parents',
        children: [
          {
            icon: mdiLinkPlus,
            key: 'add-parent-scope',
            title: 'Zu Scope hinzufügen',
            action: () => console.log('5')
          },
          {
            icon: mdiLinkPlus,
            key: 'add-parent-object',
            title: 'Zu Objekt hinzufügen',
            action: () => console.log('6')
          }
        ]
      },
      {
        title: 'Risiken...',
        key: 'risks',
        children: [
          {
            icon: mdiPlus,
            key: 'add-risk',
            title: 'Risiko erstellen & hinzufügen',
            action: () => console.log('7')
          }
        ]
      }
    ]);

    return {
      actions,
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
    "parents": "parents",
    "risks": "risks",
    "subEntities": "subentities",
    "updatedAt": "last change"
  },
  "de": {
    "by": "von",
    "createdAt": "erstellt",
    "links": "Verlinkungen",
    "noDescription": "Keine Beschreibung vorhanden",
    "parents": "Eltern",
    "risks": "Risiken",
    "subEntities": "Unterobjekte",
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
