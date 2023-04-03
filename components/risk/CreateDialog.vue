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
  <BaseDialog
    v-model="dialog"
    :close-disabled="creatingRisks"
    :persistent="creatingRisks"
    :headline="upperFirst(t('createRisk', 0).toString())"
    x-large
    fixed-footer
    v-bind="$attrs"
  >
    <template #default>
      <ObjectFilterBar
        :domain-id="domainId"
        :filter="filter"
        :disabled-fields="['objectType', 'subType']"
        :required-fields="['objectType']"
        @update:filter="onFilterUpdate"
      />
      <BaseCard>
        <ObjectTable
          v-model="selectedScenarios"
          v-model:page="page"
          v-model:sort-by="sortBy"
          show-select
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="notAlreadyUsedScenarios"
          :loading="objectsQueryIsLoading"
        />
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="creatingRisks"
        @click="dialog = false"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :loading="creatingRisks"
        :disabled="!selectedScenarios.length || ability.cannot('manage', 'objects')"
        @click="onSubmit"
      >
        {{ t('createRisk', { plural: selectedScenarios.length, named: { count: selectedScenarios.length } }) }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, omit, upperFirst } from 'lodash';

import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import objectQueryDefinitions, { IVeoFetchRisksParameters } from '~/composables/api/queryDefinitions/objects';
import { useVeoUser } from '~/composables/VeoUser';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useFetchObjects } from '~~/composables/api/objects';
import { useQuery } from '~~/composables/api/utils/query';

export default defineComponent({
  props: {
    modelValue: {
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
  emits: ['update:model-value', 'success'],
  setup(props, { emit }) {
    const config = useRuntimeConfig();
    const { tablePageSize } = useVeoUser();
    const route = useRoute();
    const { t } = useI18n();
    const { t: globalT } = useI18n();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();

    const { mutateAsync: createRisk } = useMutation(objectQueryDefinitions.mutations.createOrUpdateRisk);

    const unit = computed(() => separateUUIDParam(route.params.unit as string).id);

    // Layout stuff
    const dialog = computed({
      get() {
        return props.modelValue;
      },
      set(newValue: boolean) {
        if (!newValue) {
          selectedScenarios.value = [];
        }
        emit('update:model-value', newValue);
      }
    });

    // Filter stuff
    const selectedScenarios = ref<IVeoEntity[]>([]);

    const polluteTable = () => {
      if(!risks.value?.length || !objects.value?.items?.length) {
        return;
      }

      for(const risk of risks.value) {
        // Get id of scenario
        const objectId = getEntityDetailsFromLink(risk.scenario).id;

        // If scenario is already part of selected scenarios, skip
        if(selectedScenarios.value.find((object) => object.id === objectId)) {
          continue;
        }

        // Add scenario to selected objects
        const object = objects.value.items.find((object) => object.id === objectId);
        if(object) {
          selectedScenarios.value.push(object);
        }
      }
    };

    const filter = ref<Record<string, any>>({
      objectType: 'scenario',
      subType: 'SCN_Scenario'
    });

    const onFilterUpdate = (newFilter: any) => {
      filter.value = newFilter;
      refetch();
    };

    const page = ref(1);
    const sortBy = ref([{ key: 'name', order: 'desc' }]);
    const combinedQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: sortBy.value[0].key,
      sortOrder: sortBy.value[0].order,
      page: page.value,
      unit: unit.value,
      ...omit(filter.value, 'objectType'),
      endpoint: 'scenarios'
    }));

    const { data: objects, isFetching: objectsQueryIsLoading, refetch } = useFetchObjects(combinedQueryParameters, { keepPreviousData: true });
    const risksQueryParameters = computed<IVeoFetchRisksParameters>(() => ({
      endpoint: 'processes',
      id: props.objectId
    }));
    const { data: risks } = useQuery(objectQueryDefinitions.queries.fetchRisks, risksQueryParameters);

    watch(() => objects.value, polluteTable, { deep: true, immediate: true });
    watch(() => risks.value, polluteTable, { deep: true, immediate: true });

    const notAlreadyUsedScenarios = computed<IVeoPaginatedResponse<IVeoEntity[] & { disabled?: boolean }> | undefined>(() => {
      const _objects = cloneDeep(objects.value);

      _objects?.items.forEach((item: IVeoEntity & { disabled?: boolean }) => {
        if(risks.value?.find((risk) => getEntityDetailsFromLink(risk.scenario).id === item.id)) {
          item.disabled = true;
        }
      });

      return _objects;
    });

    // Create risk stuff
    const creatingRisks = ref(false);

    const onSubmit = async () => {
      if(ability.value.cannot('manage', 'objects')) {
        return;
      }
      creatingRisks.value = true;

      // Create new risks, but only for those scenarios that aren't yet linked to a risk!
      const newRisks = selectedScenarios.value
        .filter((scenario) => !risks.value?.find((risk) => getEntityDetailsFromLink(risk.scenario).id === scenario.id))
        .map((scenario) => ({
          scenario: {
            targetUri: `${config.public.apiUrl}/scenarios/${scenario.id}`
          },
          domains: {
            [props.domainId]: {
              reference: {
                targetUri: `${config.public.apiUrl}/domains/${props.domainId}`
              },
              riskDefinitions: {
                DSRA: {}
              }
            }
          }
        }));

      try {
        await Promise.all(newRisks.map((risk: any) => createRisk({ endpoint: 'processes', objectId: props.objectId, risk })));
        displaySuccessMessage(t('risksCreated', selectedScenarios.value.length));
        selectedScenarios.value = [];
        emit('success');
      } catch (e: any) {
        displayErrorMessage(t('createRiskError', selectedScenarios.value.length), e.message);
      }

      creatingRisks.value = false;
    };

    return {
      ability,
      creatingRisks,
      dialog,
      filter,
      objects,
      objectsQueryIsLoading,
      page,
      sortBy,
      notAlreadyUsedScenarios,
      onSubmit,
      onFilterUpdate,
      selectedScenarios,

      t,
      globalT,
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
