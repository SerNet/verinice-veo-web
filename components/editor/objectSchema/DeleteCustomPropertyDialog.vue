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
  <BaseDialog
    :model-value="modelValue"
    :headline="t('deleteCustomAspect')"
    v-bind="$attrs"
  >
    <template #default>
      <span>{{ t(`delete.${type}`, { title }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$emit('delete-item')"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String as PropType<'aspect' | 'link'>,
      required: true
    }
  },
  emits: ['update:model-value', 'delete-item'],
  setup() {
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });

    return { t, globalT };
  }
});
</script>

<i18n>
{
  "en": {
    "deleteCustomAspect": "Delete custom aspect",
    "delete": {
      "aspect": "Do you really want to delete the aspect \"{title}\"?",
      "link": "Do you really want to delete the link \"{title}\"?"
    }
  },
  "de": {
    "deleteCustomAspect": "Custom aspect löschen",
    "delete": {
      "aspect": "Möchten Sie den Aspekt \"{title}\" wirklich löschen?",
      "link": "Möchten Sie den Link \"{title}\" wirklich löschen?"
    }
  }
}
</i18n>
