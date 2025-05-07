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
  <div class="object-details">
    <BaseTabs v-model="internalActiveTab">
      <template #tabs>
        <div v-for="tab in tabs" v-show="!tab.hidden" :key="tab.key">
          <v-tooltip v-if="tab.disabled" location="top" :aria-label="t(tab.key)">
            <template #activator="{ props: tooltipProps }">
              <v-tab
                v-bind="tooltipProps"
                :disabled="tab.disabled"
                :data-component-name="`object-details-${tab.key}-tab`"
              >
                {{ t(tab.key) }}
              </v-tab>
            </template>
            <span>{{ tab.tooltip ?? t('defaultDisabledTooltip') }}</span>
          </v-tooltip>
          <v-tab v-else :data-component-name="`object-details-${tab.key}-tab`" tabindex="0">
            {{ getTabLabel(tab) }}
          </v-tab>
        </div>
      </template>
      <template #items>
        <v-window-item v-for="tab in tabs" :key="tab.key">
          <BaseCard>
            <ObjectDetailsTab
              v-if="object"
              :type="tab.key"
              :object="object"
              :dense="dense"
              :domain-id="domainId"
              @reload="emit('reload')"
            />
          </BaseCard>
        </v-window-item>
      </template>
    </BaseTabs>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '~/composables/utils';
import { useVeoPermissions } from '~/composables/VeoPermissions';

import type { IVeoEntity } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    domainId: string;
    object?: IVeoEntity;
    loading?: boolean;
    activeTab?: string;
    dense?: boolean;
  }>(),
  {
    object: undefined,
    loading: false,
    activeTab: 'childObjects',
    dense: false
  }
);

const emit = defineEmits<{
  'update:activeTab': [value: string];
  reload: [value: void];
}>();

const { data: config } = useConfiguration();
const { data: currentDomain } = useCurrentDomain();

const { t, locale } = useI18n();
const { formatDateTime } = useFormatters();

// Display logic for tabs

// SCOPES are special, so they come with their own set of tabs
const isScope = computed(() => props.object?.type === 'scope');

// RISKS
const isRiskAffected = computed(() => config.value?.riskAffectedObjectTypes?.includes(props.object?.type) || false);

const hasRiskTab = computed(
  () => Object.keys(currentDomain.value?.riskDefinitions || {}).length > 0 && isRiskAffected.value
);

const isRiskTabDisabled = computed(() => isScope.value && !props.object?.riskDefinition);

// CONTROlS
const hasComplianceControlSubType = computed(() => !!currentDomain.value?.complianceControlSubType);
const hasControlsTab = computed(() => hasComplianceControlSubType.value && isRiskAffected.value);

const tabs = computed<{ key: string; disabled?: boolean; hidden?: boolean; tooltip?: string }[]>(() => [
  {
    key: 'childScopes',
    hidden: !isScope.value
  },
  {
    key: 'childObjects'
  },
  {
    key: 'parentScopes'
  },
  {
    key: 'parentObjects',
    hidden: isScope.value
  },
  {
    key: 'links'
  },
  {
    key: 'controls', // is also called `modules` in the UI
    hidden: !hasControlsTab.value
  },
  {
    key: 'targets',
    hidden:
      props.object?.subType !== currentDomain.value?.raw?.controlImplementationConfiguration?.complianceControlSubType
  },
  {
    key: 'risks',
    disabled: isRiskTabDisabled.value,
    tooltip: t('risksDisabledTooltip'),
    hidden: !hasRiskTab.value
  }
]);

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

const getTabLabel = (tab: { key: string }) => {
  if (tab.key === 'controls') {
    return (
      currentDomain.value?.raw?.elementTypeDefinitions['control']?.translations[locale.value]?.[
        `control_${currentDomain.value?.complianceControlSubType}_plural`
      ] ?? t(tab.key)
    );
  }
  return t(tab.key);
};
</script>
<i18n src="~/locales/base/components/object-details.json"></i18n>
