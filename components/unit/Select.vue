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
      <v-autocomplete
        :model-value="unit"
        :items="displayedUnits"
        item-title="name"
        item-value="id"
        :item-disabled="(item: any) => !getFirstDomainDomaindId(item)"
        hide-details
        :label="t('unit')"
        flat
        single-line
        variant="underlined"
        @update:model-value="doChangeUnit"
      />
    </v-list-item>
    <v-list-item
      @click="$emit('create-unit')"
    >
      <v-list-item-title>
        {{ t('createUnit') }}
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuery } from '~~/composables/api/utils/query';

export default defineComponent({
  emits: ['create-unit'],
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const unit = computed(() => (route.params.unit && separateUUIDParam(route.params.unit as string).id) || undefined);

    const { data: displayedUnits } = useQuery(unitQueryDefinitions.queries.fetchAll);

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

<i18n>
{
  "en": {
    "createUnit": "Create unit",
    "unit": "Unit"
  },
  "de": {
    "createUnit": "Unit erstellen",
    "unit": "Unit"
  }
}
</i18n>
