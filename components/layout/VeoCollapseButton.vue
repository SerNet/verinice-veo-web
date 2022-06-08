<!--
   - verinice.veo web
   - Copyright (C) 2021  Tino Groteloh, Davit Svandize, Jonas Heitmann
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
  <v-tooltip bottom>
    <template #activator="{ on }">
      <v-btn
        class="collapse-button px-0 white"
        :class="{'collapse-button--right': right}"
        small
        elevation="0"
        @click="$emit('input', !value)"
        v-on="on"
      >
        <v-icon>{{ chevron }}</v-icon>
      </v-btn>
    </template>
    <template
      #default
    >
      {{ t(value ? 'expand' : 'collapse', { elementName: elementName || t('page').toString() }) }}
      <span v-if="index !== undefined"><br>(Alt/{{ t('control') }} + {{ index + 1 }})</span>
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  name: 'CollapseButton',
  props: {
    value: {
      default: false, // true if collapsed
      type: Boolean
    },
    right: {
      type: Boolean,
      default: false
    },
    elementName: {
      type: String,
      default: undefined
    },
    index: {
      type: Number,
      default: undefined
    }
  },
  setup(props) {
    const { t } = useI18n();

    const chevron = computed(() => {
      if (props.right) {
        return mdiChevronLeft;
      } else {
        return mdiChevronRight;
      }
    });

    return { chevron, t };
  }
});
</script>

<i18n>
{
  "en": {
    "collapse": "Collapse {elementName}",
    "control": "Ctrl",
    "expand": "Expand {elementName}",
    "page": "page"
  },
  "de": {
    "collapse": "{elementName} verstecken",
    "control": "Strg",
    "expand": "{elementName} anzeigen",
    "page": "Seite"
  }
}
</i18n>

<style lang="scss" scoped>
.collapse-button {
  position: absolute !important;
  min-width: 35px !important;

  top: 0;
  z-index: 1;

  &:not(.collapse-button--right) {
    left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.collapse-button--right {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>