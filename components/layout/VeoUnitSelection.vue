<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <div style="display: contents">
    <v-list-item>
      <v-list-item-content>
        <v-autocomplete
          :value="unit"
          :items="units"
          item-text="name"
          item-value="id"
          hide-details
          :label="t('unit.select.label')"
          dense
          flat
          single-line
          @change="doChangeUnit"
        />
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      @click="doCreateUnit()"
    >
      <v-list-item-title>
        {{ t('unit.create.short') }}
        </v-btn>
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoUnit } from '~/types/VeoTypes';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  props: {
    units: {
      type: Array as PropType<IVeoUnit[]>,
      required: true
    }
  },
  emits: {
    [VeoEvents.UNIT_CHANGED]: (_: boolean) => {},
    [VeoEvents.UNIT_CREATE]: (_: boolean) => {}
  },
  setup(_, { root }) {
    const { t } = useI18n();
    const route = useRoute();

    const unit = computed(() => (route.value.params.unit && separateUUIDParam(route.value.params.unit).id) || undefined);

    const doChangeUnit = (unit: string) => {
      root.$emit(VeoEvents.UNIT_CHANGED, unit);
    };

    const doCreateUnit = (persistent: boolean = false) => {
      root.$emit(VeoEvents.UNIT_CREATE, persistent);
    };

    return {
      doChangeUnit,
      doCreateUnit,
      unit,

      t
    };
  }
});
</script>
