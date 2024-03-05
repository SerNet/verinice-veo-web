<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
  <v-list-item :lines="lines">
    <template v-if="styling" #prepend>
      <v-avatar :color="styling.color">
        <v-icon size="small" :icon="styling.icon" color="white" />
      </v-avatar>
    </template>
    <v-list-item-title class="caption" v-text="title" />
    <v-list-item-subtitle v-if="scope">
      {{ scope }}
    </v-list-item-subtitle>
    <slot name="description" />
    <template #append>
      <v-list-item-action class="ml-3">
        <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>
          <span v-if="translate">
            {{ t(`editor.inputtypes.${styling.name}`) }}
          </span>
          <span v-else>
            {{ styling.name }}
          </span>
        </v-chip>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>
<script lang="ts">
import { PropType } from 'vue';

import { IInputType } from '~/types/VeoEditor';

export default defineComponent({
  props: {
    scope: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    lines: {
      type: String as PropType<'one' | 'two' | 'three'>,
      default: 'one'
    },
    styling: {
      type: Object as PropType<IInputType>,
      default: () => ({})
    },
    translate: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n();
    return {
      t
    };
  }
});
</script>
