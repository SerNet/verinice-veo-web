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
    :close-disabled="savingRisk"
    :persistent="savingRisk || formIsDirty"
    :headline="upperFirst(!!risk ? t('editRisk') : t('createRisk').toString())"
    x-large
    fixed-footer
    fixed-header
    v-on="$listeners"
  >
    <template #default>
      <v-form
        v-if="data"
        v-model="formIsValid"
      >
        <VeoObjectSelect
          v-model="data.scenario"
          object-type="scenario"
          sub-type="SCN_Scenario"
          :domain-id="domainId"
          value-as-link
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        v-cy-name="'cancel-button'"
        text
        :disabled="savingRisk"
        @click="dialog = false"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-cy-name="'save-button'"
        text
        color="primary"
        :loading="savingRisk"
        :disabled="!formIsValid"
        @click="saveRisk"
      >
        {{ !!risk ? t('editRisk') : t('createRisk') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from '@vue/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    risk: {
      type: Object as PropType<IVeoRisk>,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const dialog = computed({
      get() {
        return props.value;
      },
      set(newValue: boolean) {
        emit('input', newValue);
      }
    });

    const formIsValid = ref(false);
    const formIsDirty = ref(false);

    const data = ref({
      scenario: {}
    });
    watch(
      () => props.risk,
      (newValue) => {
        data.value = newValue;
        formIsValid.value = false;
        formIsDirty.value = false;
      },
      {
        deep: true,
        immediate: true
      }
    );

    const savingRisk = ref(false);
    const saveRisk = () => console.log('Bla123');

    return {
      data,
      dialog,
      formIsDirty,
      formIsValid,
      saveRisk,
      savingRisk,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createRisk": "create risk",
    "editRisk": "edit risk"
  },
  "de": {
    "createRisk": "risiko erstellen",
    "editRisk": "risiko bearbeiten"
  }
}
</i18n>