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
    :model-value="modelValue && !!item"
    :title="t('headline')"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <span class="text-body-1">
        {{ t('text', { displayName: item && item.displayName }) }}
      </span>
      <slot name="append"></slot>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ $t('global.button.no') }}
      </v-btn>

      <v-spacer />

      <v-btn color="primary" :disabled="!item" variant="text" @click="emit('exit', !!item?.id)">
        {{ $t('global.button.yes') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import type { IVeoEntity } from '~/types/VeoTypes';

withDefaults(
  defineProps<{
    modelValue: boolean;
    item: IVeoEntity | undefined;
  }>(),
  {
    modelValue: false,
    item: undefined
  }
);

const emit = defineEmits<{
  (event: 'update:model-value' | 'exit', value: boolean): void;
}>();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
</script>

<i18n src="~/locales/base/components/object-unsaved-changes-dialog.json"></i18n>
