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
    <template #activator="{ on }">
      <div
        class="d-inline-block"
        v-on="on"
        @click.prevent
      >
        <v-btn
          color="primary"
          :disabled="!demoUnit || units.length === 0"
          :icon="iconOnly"
          depressed
          :class="{
            'veo-demo-unit-button': !iconOnly
          }"
          style="height: 40px; width: 100%; border-radius: 12px"
          @click="toggleDemoUnit"
        >
          <v-icon
            :left="!iconOnly"
          >
            {{ buttonIcon }}
          </v-icon>
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
import { mdiLoginVariant, mdiLogoutVariant } from '@mdi/js';
import { defineComponent, ref, computed, Ref, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoUnit } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';

export default defineComponent({
  props: {
    iconOnly: {
      type: Boolean,
      default: false
    }
  },
  setup(_props, context) {
    const { t } = useI18n();
    const { $api, app, params } = useContext();

    // Demo unit/unit selection
    const units: Ref<IVeoUnit[]> = ref([]);

    async function loadUnits() {
      units.value = await $api.unit.fetchAll();
    }

    const currentUnit = computed(() => separateUUIDParam(params.value.unit).id);
    const demoUnit = computed(() => units.value.find((unit) => unit.name === 'Demo'));
    const userIsInDemoUnit = computed(() => currentUnit.value === demoUnit.value?.id);
    const buttonIcon = computed(() => (userIsInDemoUnit.value ? mdiLogoutVariant : mdiLoginVariant));

    function toggleDemoUnit() {
      if (userIsInDemoUnit.value) {
        app.router?.push(`/${createUUIDUrlParam('unit', LocalStorage.unitBeforeDemoUnit || units.value[0].id)}`);
      } else if (demoUnit.value) {
        LocalStorage.unitBeforeDemoUnit = currentUnit.value;
        app.router?.push(`/${createUUIDUrlParam('unit', demoUnit.value.id)}`);
      }
    }

    loadUnits();

    context.root.$on(VeoEvents.UNIT_CREATED, () => {
      loadUnits();
    });

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
.veo-demo-unit-button ::v-deep.v-btn__content {
  justify-content: start;
}
</style>