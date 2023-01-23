<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize
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
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltip, attrs }">
      <v-icon
        size="small"
        v-bind="mergeProps(attrs, tooltip)"
        :icon="icon"
      />
    </template>
    <span>{{ t(modelValue) }}</span>
  </v-tooltip>
</template>
<script lang="ts" setup>
import { mergeProps, PropType } from 'vue';

import { getRuleEffectIcons } from '~/lib/FormSchemaHelper';

const props = defineProps({
  modelValue: {
    type: String as PropType<'SHOW' | 'HIDE'>,
    default: undefined
  }
});

const { t } = useI18n();
  
const icon = getRuleEffectIcons(props.modelValue);
</script>

<i18n>
{
  "en": {
    "SHOW": "The element will be shown based on a rule",
    "HIDE": "The element will be hidden based on a rule" 
  },
  "de": {
    "SHOW": "Das Element wird basierend auf einer Regel angezeigt",
    "HIDE": "Das Element wird basierend auf einer Regel versteckt" 
  }
}
</i18n>
