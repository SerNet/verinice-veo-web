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
  <VeoDialog
    :model-value="value"
    :headline="t('deleteControlHeadline')"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      {{ t('deleteControlConfirmation') }}
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
        @click="$emit('delete')"
      >
        {{ t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts" setup>
defineProps({
  value: {
    type: Boolean,
    default: false
  }
});

defineEmits(['delete', 'input', 'update:model-value']);

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "deleteControlHeadline": "Delete element",
    "deleteControlConfirmation": "Do you really want to remove the element from the form schema?"
  },
  "de": {
    "deleteControlHeadline": "Element löschen",
    "deleteControlConfirmation": "Möchten Sie das Element wirklich aus dem Formschema entfernen?"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
