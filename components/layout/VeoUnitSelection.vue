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
          :items="displayedUnits"
          item-text="name"
          item-value="id"
          :item-disabled="(item) => !getFirstDomainDomaindId(item)"
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
      @click="$emit('create-unit')"
    >
      <v-list-item-title>
        {{ t('unit.create.short') }}
        </v-btn>
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext, useFetch, useRoute, useRouter } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoUnit } from '~/types/VeoTypes';
import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  props: {
    units: {
      type: Array as PropType<IVeoUnit[]>,
      required: true
    }
  },
  emits: {
    'create-unit': () => {}
  },
  setup() {
    const { $api } = useContext();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const unit = computed(() => (route.value.params.unit && separateUUIDParam(route.value.params.unit).id) || undefined);
    const displayedUnits = ref<IVeoUnit[]>();

    useFetch(async () => {
      displayedUnits.value = await $api.unit.fetchAll();
    });

    const doChangeUnit = (unitId: string) => {
      const unit = displayedUnits.value?.find((unit) => unit.id === unitId);
      if (unit) {
        const domainId = getFirstDomainDomaindId(unit) as string;
        router.push({
          name: 'unit-domains-domain',
          params: {
            unit: createUUIDUrlParam('unit', unitId),
            domain: createUUIDUrlParam('domain', domainId)
          }
        });
      }
    };

    return {
      getFirstDomainDomaindId,
      displayedUnits,
      doChangeUnit,
      unit,

      t
    };
  }
});
</script>
