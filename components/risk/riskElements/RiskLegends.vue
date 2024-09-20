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
  <div>
    <div class="d-flex align-center">
      <v-card-subtitle class="pr-0">{{ title }} </v-card-subtitle>
      <v-btn :icon="mdiPencil" variant="plain" size="small" />
    </div>

    <div class="px-4">
      <v-chip
        v-for="item in items"
        :key="item.ordinalValue"
        outlined
        rounded
        size="small"
        :style="{
          marginLeft: '1px',
          marginRight: '1px',
          marginTop: '1px',
          marginBottom: '1px',
          backgroundColor: item.htmlColor,
          color: getMostContrastyColor(item.htmlColor)
        }"
      >
        {{
          (item.translations[locale] && item.translations[locale].name) || Object.values(item.translations)[0].name
        }}&nbsp;</v-chip
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js';
import { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel } from '~/types/VeoTypes';

defineProps({
  items: {
    type: (Array as PropType<IVeoRiskPotentialImpact[]>) || (Array as PropType<IVeoRiskProbabilityLevel[]>),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  getMostContrastyColor: {
    type: Function,
    required: true
  }
});
const { locale } = useI18n();
</script>
