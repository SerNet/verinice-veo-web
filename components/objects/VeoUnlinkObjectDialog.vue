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
  <VeoDialog
    :value="value"
    v-bind="$attrs"
    :headline="t('unlinkObject')"
    v-on="$listeners"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { displayName: objectToRemove && objectToRemove.displayName, parentDisplayName: parent && parent.displayName }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        :data-cy="$utils.prefixCyData($options, 'cancel-button')"
        @click="$emit('input', false)"
      >
        {{ t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!objectToRemove"
        :data-cy="$utils.prefixCyData($options, 'confirm-button')"
        :loading="unlinking"
        @click="unlinkObject"
      >
        {{ t('unlinkObject') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { useUnlinkObject } from '~/composables/VeoObjectUtilities';

import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
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
  },
  setup(props, { emit }) {
    const { t } = useI18n();
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

    return {
      unlinking,
      unlinkObject,

      t
    };
  }
});
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
