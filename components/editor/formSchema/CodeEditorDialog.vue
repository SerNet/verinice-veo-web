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
    v-bind="$attrs"
    large
    fixed-footer
    :title="t('formSchema')"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <BaseCard style="min-height: 20vh">
        <UtilCodeEditor :model-value="code" readonly />
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn variant="text" color="primary" @click="$emit('update:model-value', false)">
        {{ t('global.button.close') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  code: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: false
});

const emit = defineEmits(['update:model-value']);

const { t } = useI18n();
</script>

<i18n src="~/locales/base/components/editor-form-schema-code-editor-dialog.json"></i18n>
