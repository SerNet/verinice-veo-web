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
  <v-list-item :two-line="twoLine">
    <v-list-item-avatar size="32">
      <v-icon
        v-if="styling"
        small
        :class="styling.color"
        color="white"
        outlined
        dark
        v-text="styling.icon"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title
        class="caption"
        v-text="title"
      />
      <slot name="description" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip
        v-if="styling"
        :color="styling.color"
        class="mr-2"
        small
        label
        outlined
      >
        <span v-if="translate">
          {{ t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else>
          {{ styling.name }}
        </span>
      </v-chip>
    </v-list-item-action>
    <slot name="right-space" />
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { IInputType } from '~/types/VeoEditor';

interface IProps {
  styling: IInputType;
  disabled: boolean;
  translate: boolean;
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: undefined
    },
    twoLine: {
      type: Boolean
    },
    styling: {
      type: Object,
      default: () => {}
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
