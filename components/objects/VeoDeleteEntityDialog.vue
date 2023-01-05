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
    v-bind="$attrs"
    :headline="t('headline')"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { displayName }) }}</span>
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
        :disabled="!deleteButtonEnabled"
        @click="deleteObject"
      >
        {{ t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { PropType } from 'vue';

import { useDeleteObject } from '~/composables/api/objects';
import { useFetchSchemas } from '~/composables/api/schemas';

import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<IVeoEntity>,
      default: undefined
    }
  },
  emits: ['success', 'error', 'input'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { mutateAsync: doDelete } = useDeleteObject();
    const { data: endpoints } = useFetchSchemas();

    const displayName = computed(() => props.item?.displayName ?? '');

    const deleteButtonEnabled = computed(() => !!endpoints.value?.[props.item?.type]);
    const deleteObject = () => {
      if (!deleteButtonEnabled.value) {
        return;
      }
      try {
        doDelete({ endpoint: endpoints.value?.[props.item.type], id: props.item.id });
        emit('success');
      } catch (error) {
        emit('error', error);
      }
    };

    return {
      deleteButtonEnabled,
      deleteObject,
      displayName,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "text": "Do you really want to delete the object \"{displayName}\"?",
    "headline": "Delete object"
  },
  "de": {
    "text": "Möchten Sie das Objekt \"{displayName}\" wirklich löschen?",
    "headline": "Objekt löschen"
  }
}
</i18n>
