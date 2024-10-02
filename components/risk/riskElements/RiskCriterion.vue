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
  <v-col cols="12">
    <v-card class="elevation-2" outlined rounded="xl">
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-card-title class="pr-0">{{ title }}</v-card-title>
          <v-btn :icon="mdiPencil" variant="plain" size="small" class="d-none" />
        </div>
        <v-btn :icon="mdiDelete" variant="plain" size="small" class="d-none" />
      </div>
      <v-card-subtitle>{{ t('categories') }}</v-card-subtitle>
      <div class="px-4 d-flex align-center flex-wrap">
        <v-tooltip
          v-for="impact in impacts"
          :key="impact.ordinalValue"
          max-width="400px"
          top
          :text="
            (impact.translations[locale] && impact.translations[locale].description) ||
            Object.values(impact.translations)[0].description
          "
        >
          <template #activator="{ props }">
            <div v-bind="props">
              <v-chip
                :style="{
                  marginLeft: '1px',
                  marginRight: '1px',
                  marginTop: '1px',
                  marginBottom: '1px',
                  backgroundColor: impact.htmlColor,
                  color: getMostContrastyColor(impact.htmlColor)
                }"
                outlined
                rounded
                size="small"
              >
                {{
                  (impact.translations[locale] && impact.translations[locale].name) ||
                  Object.values(impact.translations)[0].name
                }}
              </v-chip>
            </div>
          </template>
        </v-tooltip>
        <v-btn :icon="mdiPencil" variant="plain" size="small" @click="emit('edit')" />
      </div>

      <!-- Risk Matrix -->
      <Matrix
        v-if="value.length > 0"
        :probabilities="probabilities"
        :value="value"
        :risk-values="riskValues"
        :get-most-contrasty-color="getMostContrastyColor"
        :impacts="impacts"
      />
      <div v-else class="d-flex align-center">
        <v-card-subtitle class="pr-0">{{ t('noMatrix') }}</v-card-subtitle>
        <v-btn :icon="mdiPencil" variant="plain" size="small" class="d-none"> </v-btn>
      </div>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { mdiDelete, mdiPencil } from '@mdi/js';
import { defineProps } from 'vue';
import { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel, IVeoRiskValueLevel } from '~/types/VeoTypes';
import Matrix from './Matrix.vue';
const { locale, t } = useI18n();

defineProps({
  value: {
    type: Array as PropType<IVeoRiskValueLevel[][]>,
    default: () => []
  },
  probabilities: {
    type: Array as PropType<IVeoRiskProbabilityLevel[]>,
    default: () => []
  },
  impacts: {
    type: Array as PropType<IVeoRiskPotentialImpact[]>,
    default: () => []
  },
  riskValues: {
    type: Array as PropType<IVeoRiskValueLevel[]>,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  }
});

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const CONTRAST_THRESHOLD = 90;
const getMostContrastyColor = (backgroundColor: string) => {
  if (backgroundColor) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > CONTRAST_THRESHOLD ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
};
</script>
<i18n>
  {
    "en": {
      "categories": "Categories:",
      "NoMatrix": "No risk matrix defined."
    },
    "de": {
      "categories": "Kategorien:",
      "NoMatrix": "Keine Risikomatrix definiert."
    }
  }
  </i18n>
