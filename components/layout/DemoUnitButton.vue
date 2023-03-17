<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <v-tooltip
    top
    :disabled="!!demoUnit"
  >
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="d-block"
        @click.prevent
      >
        <v-btn
          v-bind="$attrs"
          color="primary"
          :disabled="!demoUnit || units.length === 0"
          :icon="iconOnly"
          flat
          :class="{
            'veo-demo-unit-button': !iconOnly
          }"
          style="height: 40px; width: 100%; border-radius: 12px"
          data-component-name="demo-unit-button"
          @click="toggleDemoUnit"
        >
          <v-icon
            :start="!iconOnly"
            :icon="buttonIcon"
          />
          <span v-if="userIsInDemoUnit && !iconOnly">
            {{ t('leaveDemoUnit') }}
          </span>
          <span v-else-if="!iconOnly">
            {{ t('goToDemoUnit') }}
          </span>
        </v-btn>
      </div>
    </template>
    <template #default>
      {{ t('noDemoUnit') }}
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { StorageSerializers, useStorage } from '@vueuse/core';
import { mdiLoginVariant, mdiLogoutVariant } from '@mdi/js';

import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';
import { useVeoUser } from '~/composables/VeoUser';
import unitQueryDefinitions, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { useQuery } from '~~/composables/api/utils/query';

export default defineComponent({
  props: {
    iconOnly: {
      type: Boolean,
      default: false
    }
  },
  setup(_props) {
    const { t } = useI18n();
    const { authenticated } = useVeoUser();
    const router = useRouter();
    const route = useRoute();

    // Demo unit/unit selection

    const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll, undefined,{
      enabled: authenticated
    });

    const currentUnit = computed(() => separateUUIDParam(route.params.unit as string).id);
    const demoUnit = computed(() => (units.value || []).find((unit) => unit.name === 'Demo'));
    const nonDemoUnits = computed(() => (units.value || []).filter((unit) => unit.name !== 'Demo'));

    const userIsInDemoUnit = computed(() => currentUnit.value === demoUnit.value?.id);
    const buttonIcon = computed(() => (userIsInDemoUnit.value ? mdiLogoutVariant : mdiLoginVariant));

    const unitBeforeDemoUnit = useStorage(LOCAL_STORAGE_KEYS.UNIT_BEFORE_DEMOUNIT, false, localStorage, { serializer: StorageSerializers.string });

    const nonDemoUnitDetails = computed(() => {
      const unit = unitBeforeDemoUnit.value || nonDemoUnits.value?.[0]?.id;
      const nonDemoUnit = (units.value || []).find((_unit) => _unit.id === unit) as IVeoUnit;
      if (!nonDemoUnit) {
        return undefined;
      }
      const domain = getFirstDomainDomaindId(nonDemoUnit) || '';

      return { unit, domain };
    });

    const toggleDemoUnit = () => {
      if (userIsInDemoUnit.value) {
        if (!nonDemoUnitDetails.value) {
          router.push({
            name: 'index'
          });
        } else {
          router.push({
            name: 'unit-domains-domain',
            params: {
              unit: createUUIDUrlParam('unit', nonDemoUnitDetails.value.unit),
              domain: createUUIDUrlParam('domain', nonDemoUnitDetails.value.domain)
            }
          });
        }
      } else if (demoUnit.value) {
        unitBeforeDemoUnit.value = currentUnit.value;

        router.push({
          name: 'unit-domains-domain',
          params: {
            unit: createUUIDUrlParam('unit', demoUnit.value.id),
            domain: createUUIDUrlParam('domain', getFirstDomainDomaindId(demoUnit.value) || '')
          }
        });
      }
    };

    return {
      toggleDemoUnit,
      demoUnit,
      units,
      userIsInDemoUnit,
      buttonIcon,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "goToDemoUnit": "go to demo-unit",
    "leaveDemoUnit": "leave demo-unit",
    "noDemoUnit": "No demo unit exists for this account"
  },
  "de": {
    "goToDemoUnit": "Zur Demo-Unit",
    "leaveDemoUnit": "Demo-Unit verlassen",
    "noDemoUnit": "Für diesen Account existiert keine Demo Unit"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-demo-unit-button {
  justify-content: start;
}
</style>
