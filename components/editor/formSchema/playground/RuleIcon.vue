<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-tooltip v-if="icon" location="top">
    <template #activator="{ props: tooltipProps }">
      <v-icon :icon="icon" class="mr-1" size="small" v-bind="tooltipProps" />
    </template>
    <template #default>
      {{ t(rule?.effect === 'SHOW' ? 'showRule' : 'hideRule') }}
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js';
import { PropType } from 'vue';

import { IVeoFormSchemaItemRule } from '~/composables/api/queryDefinitions/forms';

const props = defineProps({
  rule: {
    type: Object as PropType<IVeoFormSchemaItemRule>,
    default: undefined
  }
});

const { t } = useI18n();

const icon = computed(() =>
  !props.rule ? undefined
  : props.rule.effect === 'SHOW' ? mdiEyeOutline
  : mdiEyeOffOutline
);
</script>

<i18n src="~/locales/base/components/editor-formSchema-playground-RuleIcon.json"></i18n>
