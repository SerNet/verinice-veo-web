<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize
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
  <BaseDialog v-bind="$attrs" :title="t('downloadSchema')" @update:model-value="emit('update:model-value', $event)">
    <template #default>
      {{ t('invalidSchemaConfirmation') }}
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="$emit('update:model-value', false)">
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn color="primary" variant="text" @click="$emit('download')">
        {{ $t('global.button.yes') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
const emit = defineEmits(['download', 'update:model-value']);

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
</script>

<i18n>
{
  "en": {
    "downloadSchema": "Download schema",
    "invalidSchemaConfirmation": "The form schema is not compatible with current object schemas. Please don't upload it to production. Do you really want to download the schema?"
  },
  "de": {
    "downloadSchema": "Schema herunterladen",
    "invalidSchemaConfirmation": "Das Formschema ist nicht mit keinem aktuellen Objektschema kompatibel. Bitte laden Sie es nicht in der Live-Umgebung hoch. Möchten Sie das Schema trotzdem herunterladen?"
  }
}
</i18n>
