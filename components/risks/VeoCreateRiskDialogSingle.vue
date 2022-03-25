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
    :headline="upperFirst(!!risk ? t('editRisk', [risk.designator]) : t('createRisk').toString())"
    large
    fixed-footer
    fixed-header
    v-on="$listeners"
  >
    <template #default>
      <v-form
        v-if="data"
        v-model="formIsValid"
      >
        <h2 class="mb-2">
          Allgemeines
        </h2>
        <v-card
          flat
          outlined
        >
          <v-card-text>
            <VeoObjectSelect
              v-model="data.scenario"
              object-type="scenario"
              required
              sub-type="SCN_Scenario"
              :domain-id="domainId"
              value-as-link
            />
            <v-row>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  v-model="data.riskOwner"
                  object-type="person"
                  :label="t('riskOwner')"
                  value-as-link
                />
              </v-col>
              <v-col
                xs="12"
                md="6"
              >
                <VeoObjectSelect
                  v-model="data.mitigation"
                  object-type="control"
                  :label="t('mitigation')"
                  value-as-link
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <VeoCreateRiskDialogRiskDefinitions
          :domain="domain"
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
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { useContext, useFetch } from '@nuxtjs/composition-api';
import { computed, defineComponent, PropType, ref, watch } from '@vue/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoDomain, IVeoRisk } from '~/types/VeoTypes';

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
    const { $api } = useContext();
    const { t } = useI18n();

    const dialog = computed({
      get() {
        return props.value;
      },
      set(newValue: boolean) {
        emit('input', newValue);
      }
    });

    // Domain stuff, used for risk definitions
    const domain = ref<IVeoDomain | undefined>();
    const { fetch: fetchDomain } = useFetch(async () => {
      domain.value = await $api.domain.fetch(props.domainId);
    });
    watch(
      () => props.domainId,
      () => fetchDomain()
    );

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
      domain,
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
    "editRisk": "edit risk \"{0}\"",
    "mitigation": "mitigation",
    "riskOwner": "risk owner"
  },
  "de": {
    "createRisk": "Risiko erstellen",
    "editRisk": "Risiko \"{0}\" bearbeiten",
    "mitigation": "Gegenmaßnahme",
    "riskOwner": "Verantwortlicher"
  }
}
</i18n>