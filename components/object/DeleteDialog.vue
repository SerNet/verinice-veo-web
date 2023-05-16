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
    v-bind="$attrs"
    :headline="t('headline')"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { displayName }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!deleteButtonEnabled || ability.cannot('manage', 'objects')"
        @click="deleteObject"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';

import { IVeoEntity } from '~/types/VeoTypes';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useQuery } from '~~/composables/api/utils/query';

const props = defineProps({
  item: {
    type: Object as PropType<IVeoEntity>,
    default: undefined
  }
});
const emit = defineEmits(['success', 'error', 'update:model-value']);

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { mutateAsync: doDelete } = useMutation(objectQueryDefinitions.mutations.deleteObject);
const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
const { ability } = useVeoPermissions();

const displayName = computed(() => props.item?.displayName ?? '');

const deleteButtonEnabled = computed(() => !!endpoints.value?.[props.item?.type]);
const deleteObject = async () => {
  if (!deleteButtonEnabled.value || ability.value.cannot('manage', 'objects')) {
    return;
  }
  try {
    await doDelete({ endpoint: endpoints.value?.[props.item.type], id: props.item.id });
    emit('success');
  } catch (error) {
    emit('error', error);
  }
};
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
