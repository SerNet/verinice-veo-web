<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <BaseDialog
    :value="value && !!item"
    :headline="t('headline')"
    @input="$emit('model-value', $event)"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { displayName: item && item.displayName }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('input', false)"
      >
        {{ t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!item"
        @click="$emit('exit', item && item.id)"
      >
        {{ t('global.button.yes') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { PropType } from 'vue';

import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object as PropType<IVeoEntity>,
      default: undefined
    }
  },
  emits: ['input', 'exit', 'model-value'],
  setup() {
    const { t } = useI18n();

    return {
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "text": "The object \"{displayName}\" has been edited. The changes won't be saved. Do you really want to leave this page?",
    "headline": "Close"
  },
  "de": {
    "text": "Das Objekt \"{displayName}\" wurde bearbeitet. Die Änderungen werden nicht gespeichert. Wollen Sie die Seite wirklich verlassen?",
    "headline": "Verlassen"
  }
}
</i18n>
