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
    v-model="dialog.value"
    :headline="$t('deleteControlHeadline')"
  >
    <template #default>
      {{ $t('deleteControlConfirmation') }}
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'cancel')"
        @click="$emit('input', false)"
      >
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'delete')"
        @click="$emit('delete')"
      >
        {{ $t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';

interface IProps {
  value: boolean;
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value });

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val;
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val);
        }
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val);
        }
      }
    );

    return { dialog };
  }
});
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
