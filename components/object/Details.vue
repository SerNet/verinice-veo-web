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
  <div>
    <div class="object-details">
      <BaseCard>
        <v-card-text>
          <div class="text-body-1 pb-2">
            <template v-if="!loading">
              <v-row no-gutters>
                <v-col data-component-name="object-details-date-time">
                  <p class="text-no-wrap mb-0">
                    <strong>{{ upperFirst(t('updatedAt').toString()) }}:</strong>
                    {{ updatedAtFormatted || '-' }} {{ t('by') }} {{ object && object.updatedBy || '-' }}
                  </p>
                  <p class="text-no-wrap mb-0">
                    <strong>{{ upperFirst(t('createdAt').toString()) }}:</strong>
                    {{ createdAtFormatted || '-' }} {{ t('by') }} {{ object && object.createdBy || '-' }}
                  </p>
                </v-col>
                <v-col
                  cols="auto"
                  class="text-right ml-auto pt-1"
                >
                  <ObjectDetailsActionMenu
                    :disabled="ability.cannot('manage', 'objects')"
                    :object="object"
                    @reload="$emit('reload')"
                  />
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <v-skeleton-loader
                type="text"
                width="60%"
              />
              <v-skeleton-loader
                type="text"
                width="60%"
              />
            </template>
          </div>
          <div
            v-if="!loading"
            class="text-body-2 overflow-y-auto object-details__description"
            data-component-name="object-details-description"
          >
            <span v-if="object && object.description">{{ object.description }}</span>
            <i v-else>{{ t('noDescription') }}</i>
          </div>
          <div
            v-else
            class="flex-grow-0"
          >
            <v-skeleton-loader type="paragraph" />
          </div>
        </v-card-text>
      </BaseCard>
    </div>
    <BaseTabs v-model="internalActiveTab">
      <template #tabs>
        <!-- We use v-show instead of v-if, as v-show doesn't cause side effects in the v-model if risks are not present -->
        <v-tab
          v-for="tab in tabs"
          v-show="!tab.hidden"
          :key="tab.key"
          :disabled="tab.disabled"
          :data-component-name="`object-details-${tab.key}-tab`"
        >
          {{ t(tab.key) }}
        </v-tab>
      </template>
      <template #items>
        <v-window-item
          v-for="tab in tabs"
          :key="tab.key"
        >
          <BaseCard>
            <ObjectDetailsTab
              v-if="object"
              :type="tab.key"
              :object="object"
              :dense="dense"
              :domain-id="domainId"
              @reload="$emit('reload')"
            />
          </BaseCard>
        </v-window-item>
      </template>
    </BaseTabs>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

import { IVeoEntity } from '~/types/VeoTypes';
import { useFormatters } from '~/composables/utils';
import { useVeoPermissions } from '~/composables/VeoPermissions';

export default defineComponent({
  props: {
    object: {
      type: Object as PropType<IVeoEntity>,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    activeTab: {
      type: String,
      default: 'childObjects'
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
  emits: ['reload', 'update:activeTab'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { formatDateTime } = useFormatters();
    const { ability } = useVeoPermissions();

    const tabs = computed<{ key: string; disabled?: boolean; hidden?: boolean }[]>(() => [
      {
        key: 'childScopes',
        disabled: props.object?.type !== 'scope'
      },
      {
        key: 'childObjects'
      },
      {
        key: 'parentScopes'
      },
      {
        key: 'parentObjects',
        disabled: props.object?.type === 'scope'
      },
      {
        key: 'links'
      },
      {
        key: 'risks',
        hidden: !props.loading && (props.object?.type !== 'process' || subType.value === 'PRO_DataTransfer')
      }
    ]);

    const subType = computed(() => props.object?.domains[props.domainId]?.subType);

    // If the user accessed the object in the risks tab but the object doesn't have the subType data processing, force another tab
    watch(
      () => props.loading,
      (newValue, previousValue) => {
        if (previousValue && !newValue && subType.value !== 'PRO_DataProcessing' && props.activeTab === 'risks') {
          emit('update:activeTab', 'childObjects');
        }
      }
    );

    const internalActiveTab = computed({
      get() {
        return Math.max(
          0,
          tabs.value.findIndex((tab) => tab.key === props.activeTab)
        );
      },
      set(newValue: number) {
        emit('update:activeTab', tabs.value[newValue].key || 'childObjects');
      }
    });

    const createdAtFormatted = computed(() => (props.object ? formatDateTime(new Date(props.object.createdAt)).value : undefined));
    const updatedAtFormatted = computed(() => (props.object ? formatDateTime(new Date(props.object.updatedAt)).value : undefined));

    return {
      ability,
      createdAtFormatted,
      internalActiveTab,
      subType,
      tabs,
      updatedAtFormatted,

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
    "childObjects": "Parts",
    "childScopes": "Scopes",
    "createdAt": "created",
    "links": "links",
    "noDescription": "No description provided",
    "parentObjects": "Part of",
    "parentScopes": "in Scope",
    "risks": "risks",
    "updatedAt": "last change"
  },
  "de": {
    "by": "von",
    "childObjects": "Teile",
    "childScopes": "Scopes",
    "createdAt": "erstellt",
    "links": "links",
    "noDescription": "Keine Beschreibung vorhanden",
    "parentObjects": "Teil von",
    "parentScopes": "in Scope",
    "risks": "Risiken",
    "updatedAt": "letzte Änderung"
  }
}
</i18n>

<style lang="scss" scoped>
.object-details {
  min-height: 30vh;
}
.object-details__description {
  max-height: 30vh;
}
</style>
