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
  <VeoDialog
    v-model="dialog"
    :headline="t('createRisk')"
    x-large
    :persistent="isFormDirty"
    fixed-footer
    fixed-header
    v-on="$listeners"
  >
    <template #default>
      {{ dialog }}
      asdf123
    </template>
    <template #dialog-actions>
      <v-btn
        v-cy-name="'cancel-button'"
        text
        @click="dialog = false"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-cy-name="'save-button'"
        text
        color="primary"
        :disabled="!formValid"
        @click="onSubmit"
      >
        {{ t('createRisk') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  name: 'CreateRiskDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    // Layout stuff
    const dialog = computed({
      get() {
        return props.value;
      },
      set(newValue: boolean) {
        emit('input', newValue);
      }
    });

    // Form stuff
    const isFormDirty = ref(false);
    const formValid = ref(true);

    const data = ref({});

    const onSubmit = () => console.log('Bla123');

    return {
      data,
      dialog,
      formValid,
      isFormDirty,
      onSubmit,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createRisk": "create risk"
  },
  "de": {
    "createRisk": "risiko erstellen"
  }
}
</i18n>
