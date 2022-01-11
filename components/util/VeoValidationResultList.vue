<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <v-list>
    <v-list-item
      v-for="(item, index) of items"
      :key="index"
      link
    >
      <v-list-item-content style="overflow-wrap: anywhere;">
        <v-list-item-title>{{ item.code }} </v-list-item-title>
        {{ item.message }}
      </v-list-item-content>
      <v-list-item-action v-if="item.fixable && fixingAllowed">
        <v-btn
          outlined
          @click="$emit('fix', item.code, item.params)"
        >
          {{ t('fix') }}
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item v-if="items.length === 0 && showNoErrorPlaceholder">
      <v-list-item-content>
        <v-list-item-title>{{ t('noErrors') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropOptions } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

export default defineComponent({
  props: {
    items: {
      type: Array,
      default: () => []
    } as PropOptions<VeoSchemaValidatorMessage[]>,
    noErrorPlaceholderVisible: {
      type: Boolean,
      default: false
    },
    fixingAllowed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n();

    return { t };
  }
});
</script>

<i18n>
{
  "en": {
    "fix": "Fix",
    "noErrors": "No errors found!"
  },
  "de": {
    "fix": "Beheben",
    "noErrors": "Keine Fehler gefunden!"
  }
}
</i18n>
