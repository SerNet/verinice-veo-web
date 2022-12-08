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
      <VeoObjectFilterBar
        :domain-id="domainId"
        :filter="filter"
        :disabled-fields="['objectType', 'subType']"
        :required-fields="['objectType']"
        @update:filter="onFilterUpdate"
      />
      <VeoCard>
        <VeoObjectTable
          v-model="selectedScenarios"
          show-select
          checkbox-color="primary"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="objects"
          :loading="objectsQueryIsLoading"
          @page-change="onPageChange"
        />
      </VeoCard>
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
import { computed, defineComponent, reactive, ref, useContext, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IVeoEntity } from '~/types/VeoTypes';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useFetchObjects } from '~/composables/api/objects';
import { useVeoUser } from '~/composables/VeoUser';

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
    const { tablePageSize } = useVeoUser();
    const route = useRoute();
    const { t, tc } = useI18n();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    const unit = computed(() => separateUUIDParam(route.value.params.unit).id);

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
    const selectedScenarios = ref<IVeoEntity[]>([]);

    const filter = ref<IBaseObject>({
      objectType: 'scenario',
      subType: 'SCN_Scenario'
    });

    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      Object.assign(queryParameters, { page: opts.newPage, sortOrder: opts.sortDesc ? 'desc' : 'asc', sortDesc: !!opts.sortDesc });
      refetch(); // A dirty workaround, as vue-query doesn't pick up changes to the query key. Hopefully solved with nuxt 3
    };

    const onFilterUpdate = (newFilter: any) => {
      filter.value = newFilter;
      refetch();
    };

    const queryParameters = reactive({ page: 1, sortBy: 'name', sortDesc: false });
    const combinedQueryParameters = computed(() => ({
      endpoint: 'scenario',
      unit: unit.value,
      size: tablePageSize.value,
      sortBy: queryParameters.sortBy,
      sortOrder: queryParameters.sortDesc ? 'desc' : 'asc',
      page: queryParameters.page,
      ...filter.value
    }));

    const { data: objects, isFetching: objectsQueryIsLoading, refetch } = useFetchObjects(combinedQueryParameters, { keepPreviousData: true });

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
            },
            riskDefinitions: {
              DSRA: {}
            }
          }
        }
      }));

      try {
        await Promise.all(risks.map((risk: any) => $api.entity.createRisk('process', props.objectId, risk)));
        displaySuccessMessage(tc('risksCreated', selectedScenarios.value.length));
        selectedScenarios.value = [];
        emit('success');
      } catch (e: any) {
        displayErrorMessage(tc('createRiskError', selectedScenarios.value.length), e.message);
      }

      creatingRisks.value = false;
    };

    return {
      creatingRisks,
      dialog,
      filter,
      objects,
      objectsQueryIsLoading,
      onPageChange,
      onSubmit,
      onFilterUpdate,
      selectedScenarios,

      t,
      tc,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createRisk": "create risk | create risk | create {count} risks",
    "createRiskError": "Couldn't create risk | Couldn't create risks",
    "risksCreated": "The risk was created successfully | The risks were created successfully"
  },
  "de": {
    "createRisk": "risiko erstellen | risiko erstellen | {count} Risiken erstellen",
    "createRiskError": "Das Risiko konnte nicht erstellt werden | Die Risiken konnten nicht erstellt werden",
    "risksCreated": "Das Risiko wurde erstellt | Die Risiken wurden erstellt"
  }
}
</i18n>
