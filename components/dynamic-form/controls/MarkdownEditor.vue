<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <div
    v-if="options.visible"
    class="vf-markdown-editor vf-form-element"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
  >
    <div v-if="options.label" class="subtitle-1 d-flex justify-space-between mb-4">
      {{ options.label }}

      <v-btn
        v-if="!isCreateMode"
        :aria-label="editing ? t('breadcrumbs.editor') : t('global.button.cancel')"
        :disabled="!canManageUnitContent"
        color="primary"
        size="small"
        @click="enableEditing"
      >
        {{ !editing ? t('openEditor') : t('exitEditor') }}
      </v-btn>
    </div>

    <ToastUIViewer v-if="!isCreateMode && !editing" :model-value="modelValue" />

    <ToastUIEditor
      v-else
      :model-value="modelValue"
      @update:model-value="(markdown) => emit('update:model-value', markdown)"
    />
  </div>
</template>

<script lang="ts">
import type { IVeoFormsElementDefinition } from '../types';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-markdown-editor',
  name: {
    en: 'markdown editor',
    de: 'Markdown editor'
  },
  description: {
    en: 'WYSIWYG markdown editor to style input.',
    de: 'WYSIWYG Markdown editor um Eingaben zu formatieren.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'string',
    typeof props.options !== 'undefined' && props.options.format === 'markdown'
  ]
};
</script>

<script setup lang="ts">
import { last } from 'lodash';
import { VeoFormsControlProps } from '../util';

defineOptions({
  name: CONTROL_DEFINITION.code
});
const editing = ref(false);
const { ability, subject } = useVeoPermissions();
const { t } = useI18n();
const route = useRoute();
// we’re intentionally using a runtime prop object here.
// eslint-disable-next-line vue/define-props-declaration
const props = defineProps(VeoFormsControlProps);
const isCreateMode = computed(() => props.objectCreationDisabled);
const emit = defineEmits<{
  'update:model-value': [value: string | undefined];
}>();
function enableEditing() {
  editing.value = !editing.value;
}
const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);
</script>
<i18n src="~/locales/base/components/dynamic-form-controls-markdown-editor.json"></i18n>
