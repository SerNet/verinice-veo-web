<!--
  - verinice.veo web
  - Generic VeoIcon with Tooltip component
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
  <v-tooltip location="top" :aria-label="translatedTooltip">
    <template #activator="{ props: tooltipProps }">
      <div
        v-bind="tooltipProps"
        :style="{
          color: 'inherit',
          textDecoration: 'none'
        }"
      >
        <v-icon v-bind="$attrs" :icon="icon" />
      </div>
    </template>
    <template #default>
      {{ translatedTooltip }}
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
const props = defineProps<{
  icon: string | string[];
  tooltipTranslation: string;
}>();

const translatedTooltip = computed(() => props.tooltipTranslation);
</script>
