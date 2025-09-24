<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div class="my-2">
    <div class="my-2 d-flex align-center">
      <v-card-subtitle class="pr-0">{{ title }} </v-card-subtitle>
    </div>

    <div class="px-3" :data-veo-test="`risk-property-container`">
      <v-tooltip
        v-for="(item, index) in items"
        :key="item.ordinalValue"
        max-width="400px"
        top
        :text="
          (item.translations[locale] && item.translations[locale].description) ||
          Object.values(item.translations)[0].description
        "
        :data-veo-test="`risk-property-tooltip-${index}`"
      >
        <template #activator="{ props }">
          <v-chip
            v-bind="props"
            label
            outlined
            size="small"
            :style="itemStyles[index]"
            :data-veo-test="`risk-property-${index}`"
          >
            {{
              (item.translations[locale] && item.translations[locale].name) || Object.values(item.translations)[0].name
            }}&nbsp;</v-chip
          >
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getMostContrastyColor } from '~/lib/utils';
import type { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel } from '~/types/VeoTypes';

const props = defineProps({
  items: {
    type: (Array as PropType<IVeoRiskPotentialImpact[]>) || (Array as PropType<IVeoRiskProbabilityLevel[]>),
    required: true
  },
  title: {
    type: String,
    required: true
  }
});
const { locale } = useI18n();

const itemStyles = computed(() =>
  props.items.map((item) => ({
    marginLeft: '1px',
    marginRight: '1px',
    marginTop: '1px',
    marginBottom: '1px',
    backgroundColor: item.htmlColor,
    color: getMostContrastyColor(item.htmlColor)
  }))
);
</script>
