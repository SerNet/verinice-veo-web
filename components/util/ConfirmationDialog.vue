<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    :title="title"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      {{ text }}
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="cancel">
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" data-veo-test="confirmation-dialog-btn-ok" @click="handler">
        {{ confirmationText }}
      </v-btn>
      <LayoutLoadingWrapper v-if="callbackExecuting" />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  callback: () => Promise<any>;
  confirmationText: string;
  modelValue: boolean;
  text: string;
  title: string;
}>();

const emit = defineEmits<{
  (event: 'update:model-value', newValue: boolean): void;
}>();

const callbackExecuting = ref(false);

// Handler for executing the callback
const handler = async () => {
  callbackExecuting.value = true;
  await props.callback();
  callbackExecuting.value = false;
};

const cancel = () => {
  emit('update:model-value', false);
};

const { t: globalT } = useI18n({ useScope: 'global' });
</script>
