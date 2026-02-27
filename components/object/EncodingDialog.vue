<!--
   - verinice.veo web
   - Copyright (C) 2026 Haneen Husin
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
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>
        {{ t('import.selectedEncoding') }}
      </v-card-title>
      <v-card-text>
        <v-select
          v-model="selected"
          :items="encodings"
          :label="t('import.selectedEncoding') + ' *'"
          :error="!selected"
          :error-messages="!selected ? [t('global.input.required')] : []"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cancel">
          {{ t('global.button.cancel') }}
        </v-btn>
        <v-btn color="primary" :disabled="!selected" @click="confirm">
          {{ t('global.button.yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const encodings = ref([
  {
    title: 'UTF-8',
    value: 'UTF-8'
  },
  {
    title: 'ISO-8859-1',
    value: 'ISO-8859-1'
  },
  {
    title: 'ISO-8859-15',
    value: 'ISO-8859-15'
  },
  {
    title: 'Windows-1252',
    value: 'Windows-1252'
  }
]);
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', encoding: string): void;
}>();

const dialog = defineModel<boolean>();
const selected = ref<string>('UTF-8');

const cancel = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  if (!selected.value) return;
  emit('confirm', selected.value);
  emit('update:modelValue', false);
};
</script>
<i18n src="~/locales/base/components/object-csv-import-card.json"></i18n>
