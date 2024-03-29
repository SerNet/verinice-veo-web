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
    :model-value="modelValue"
    v-bind="$attrs"
    :title="t('unlinkObject')"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { displayName: objectToRemove && objectToRemove.displayName, parentDisplayName: parent && parent.displayName }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="!objectToRemove"
        :loading="unlinking"
        @click="unlinkObject"
      >
        {{ t('unlinkObject') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { useUnlinkObject } from '~/composables/VeoObjectUtilities';

import { IVeoEntity } from '~/types/VeoTypes';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  objectToRemove: {
    type: Object as PropType<IVeoEntity>,
    default: undefined
  },
  parent: {
    type: Object as PropType<IVeoEntity>,
    default: undefined
  }
});

const emit = defineEmits(['error', 'update:model-value', 'success']);
  
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { unlink } = useUnlinkObject();

const unlinking = ref(false);
const unlinkObject = async () => {
  unlinking.value = true;
  try {
    await unlink(props.parent, props.objectToRemove);
    emit('success');
  } catch (error) {
    emit('error', error);
  } finally {
    unlinking.value = false;
  }
};
</script>

<i18n>
{
  "en": {
    "text": "Unlinking \"{displayName}\" only removes the object from \"{parentDisplayName}\".",
    "unlinkObject": "Unlink object"
  },
  "de": {
    "text": "Es wird nur die Verknüpfung von \"{displayName}\" zu \"{parentDisplayName}\" entfernt.",
    "unlinkObject": "Verknüpfung entfernen"
  }
}
</i18n>
