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
    :model-value="modelValue"
    :title="title"
    :aria-label="title"
    @update:model-value="onDialogUpdate"
  >
    <template #default>
      <v-select
        v-model="type"
        data-veo-test="select-object-type"
        :items="options"
        variant="underlined"
        :label="descriptionText"
      />
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="onDialogUpdate(false)">
        {{ cancelText }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" data-veo-test="confirm-object-type" :disabled="!type" @click="handleAction">
        {{ actionButtonText }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

interface Props {
  modelValue?: boolean;
  title?: string;
  descriptionText?: string;
  cancelText?: string;
  actionButtonText?: string;
  action?: 'create-entity' | 'update:model-value' | 'select-entity';
  eventPayload?: Record<string, unknown>;
  allowedObjectTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: 'Create new object',
  descriptionText: 'Please specify the type of the new object.',
  cancelText: 'Cancel',
  actionButtonText: 'Create',
  action: 'create-entity',
  eventPayload: () => ({}),
  allowedObjectTypes: undefined
});

interface SelectEntityPayload {
  type?: string;
  [key: string]: unknown;
}

interface CreateEntityPayload {
  [key: string]: unknown;
}

const emit = defineEmits<{
  'create-entity': [payload: CreateEntityPayload];
  'update:model-value': [value: boolean];
  'select-entity': [payload: SelectEntityPayload];
}>();

const { locale } = useI18n();
const route = useRoute();

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain ?? ''
}));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const type = ref<string | undefined>();

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      type.value = undefined;
    }
  }
);

const onDialogUpdate = (value: boolean) => {
  emit('update:model-value', value);
};

const options = computed<{ title: string; value: string }[]>(() => {
  const objectSchemaNames = Object.keys(VeoElementTypePlurals);

  // Filter by allowedObjectTypes if provided
  const filteredSchemaNames =
    props.allowedObjectTypes ?
      objectSchemaNames.filter((name) => props.allowedObjectTypes!.includes(name))
    : objectSchemaNames;

  return filteredSchemaNames.map((schemaName) => ({
    value: schemaName,
    title: translations.value?.lang[locale.value]?.[schemaName] || schemaName
  }));
});

const handleAction = () => {
  switch (props.action) {
    case 'update:model-value':
      emit('update:model-value', true);
      break;
    case 'create-entity':
      emit('create-entity', { type: type.value, ...props.eventPayload });
      break;
    case 'select-entity':
      emit('select-entity', { type: type.value, ...props.eventPayload });
      break;
  }
};
</script>
