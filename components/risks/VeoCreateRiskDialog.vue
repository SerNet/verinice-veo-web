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
    :close-disabled="creatingRisks"
    :persistent="creatingRisks"
    :headline="upperFirst(tc('createRisk', 0).toString())"
    x-large
    fixed-footer
    v-on="$listeners"
  >
    <template #default>
      <v-row no-gutters>
        <v-col
          cols="auto"
          class="d-flex align-center"
        >
          <v-btn
            class="mr-2"
            rounded
            primary
            depressed
            small
            style="outline: 1px solid black"
            @click="filterDialogVisible = true"
          >
            <v-icon>{{ mdiFilter }}</v-icon> {{ upperFirst(t('filter').toString()) }}
          </v-btn>
        </v-col>
        <v-col
          cols="auto"
          class="grow"
        >
          <v-chip-group>
            <VeoObjectChip
              v-for="k in activeFilterKeys"
              :key="k"
              :label="formatLabel(k)"
              :value="formatValue(k, filter[k])"
              :close="k!='objectType' && k!='subType'"
              @click:close="clearFilter(k)"
            />
          </v-chip-group>
        </v-col>
      </v-row>
      <VeoEntitySelectionList
        v-model="selectedScenarios"
        :items="objects"
        :loading="$fetchState.pending"
        @page-change="onPageChange"
      />
      <VeoFilterDialog
        v-model="filterDialogVisible"
        :domain="domainId"
        :filter="filter"
        :disable-fields="['objectType', 'subType']"
        object-type-required
        @update:filter="onFilterUpdate"
      />
    </template>
    <template #dialog-options>
      <v-btn
        v-cy-name="'cancel-button'"
        text
        :disabled="creatingRisks"
        @click="dialog = false"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-cy-name="'save-button'"
        text
        color="primary"
        :loading="creatingRisks"
        :disabled="!selectedScenarios.length"
        @click="onSubmit"
      >
        {{ tc('createRisk', selectedScenarios.length, { count: selectedScenarios.length }) }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { omit, upperFirst } from 'lodash';
import { mdiFilter } from '@mdi/js';
import { IVeoEntity, IVeoFormSchemaMeta, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { IBaseObject } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  name: 'CreateRiskDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    objectId: {
      type: String,
      required: true
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { $api, $config } = useContext();
    const { t, tc, locale } = useI18n();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    // API stuff
    const formSchemas = ref<IVeoFormSchemaMeta[]>([]);

    const requestOptions = ref<IBaseObject>({
      page: 1
    });
    const objects = ref<IVeoPaginatedResponse<IVeoEntity[]> | undefined>(undefined);

    useFetch(async () => {
      formSchemas.value = await $api.form.fetchAll(props.domainId);
    });

    const { fetch } = useFetch(async () => {
      objects.value = await $api.entity.fetchAll('scenario', requestOptions.value.page, { ...filter.value, ...requestOptions.value });
    });

    // Layout stuff
    const dialog = computed({
      get() {
        return props.value;
      },
      set(newValue: boolean) {
        if (!newValue) {
          selectedScenarios.value = [];
        }
        emit('input', newValue);
      }
    });

    // Filter stuff
    const filterDialogVisible = ref(false);

    const selectedScenarios = ref<IVeoEntity[]>([]);

    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'];
    const filter = ref<IBaseObject>({
      objectType: 'scenario',
      subType: 'SCN_Scenario'
    });

    const activeFilterKeys = filterKeys.filter((k) => filter.value[k] !== undefined);

    const formatLabel = (label: string) => {
      return upperFirst(t(`objectlist.${label}`).toString());
    };

    const formatValue = (label: string, value?: string) => {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return upperFirst(value);
        // Translate sub types
        case 'subType':
          return formSchemas.value.find((formschema) => formschema.subType === value)?.name?.[locale.value] || value;
        default:
          return value;
      }
    };

    const clearFilter = (key: string) => {
      omit(filter.value, key);
    };

    const onPageChange = (newOptions: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      requestOptions.value = { page: newOptions.newPage, sortOrder: newOptions.sortDesc ? 'desc' : 'asc', sortBy: newOptions.sortBy };
      fetch();
    };

    const onFilterUpdate = (newFilter: any) => {
      filter.value = newFilter;
      fetch();
    };

    // Create risk stuff
    const creatingRisks = ref(false);

    const onSubmit = async () => {
      creatingRisks.value = true;
      const risks = selectedScenarios.value.map((scenario) => ({
        scenario: {
          targetUri: `${$config.apiUrl}/scenarios/${scenario.id}`
        },
        domains: {
          [props.domainId]: {
            reference: {
              targetUri: `${$config.apiUrl}/domains/${props.domainId}`
            }
          }
        }
      }));

      try {
        await Promise.all(risks.map((risk: any) => $api.entity.createRisk('process', props.objectId, risk)));
        displaySuccessMessage(tc('risksCreated', selectedScenarios.value.length));
        selectedScenarios.value = [];
        emit('success');
      } catch (e) {
        displayErrorMessage(tc('createRiskError', selectedScenarios.value.length), JSON.stringify(e));
      }

      creatingRisks.value = false;
    };

    return {
      activeFilterKeys,
      clearFilter,
      creatingRisks,
      dialog,
      filter,
      filterDialogVisible,
      formatLabel,
      formatValue,
      objects,
      onPageChange,
      onSubmit,
      onFilterUpdate,
      selectedScenarios,

      t,
      tc,
      upperFirst,
      mdiFilter
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createRisk": "create risk | create risk | create {count} risks",
    "createRiskError": "Couldn't create risk | Couldn't create risks",
    "filter": "filter",
    "risksCreated": "The risk was created successfully | The risks were created successfully"
  },
  "de": {
    "createRisk": "risiko erstellen | risiko erstellen | {count} Risiken erstellen",
    "createRiskError": "Das Risiko konnte nicht erstellt werden | Die Risiken konnten nicht erstellt werden",
    "filter": "filter",
    "risksCreated": "Das Risiko wurde erstellt | Die Risiken wurden erstellt"
  }
}
</i18n>
