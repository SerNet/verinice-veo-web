<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
    :model-value="modelValue"
    :title="unitId ? t('editUnit') : t('createUnit')"
    :close-disabled="creatingUnit || updatingUnit"
    v-bind="$attrs"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form
        ref="form"
        v-model="formIsValid"
        class="new-unit-form"
      >
        <BaseCard>
          <v-card-text>
            <v-text-field
              v-model="unitDetails.name"
              :label="t('name')"
              :rules="[requiredRule]"
              required
              variant="underlined"
            />
            <v-text-field
              v-model="unitDetails.description"
              variant="underlined"
              :label="t('description')"
            />
          </v-card-text>
        </BaseCard>

        <div class="mx-4">
          <h3 class="text-h3 mt-4">
            {{ t('domainselection') }}
          </h3>

          <UtilProminentSelectionList
            v-model="selectedDomains"
            :items="availableDomains"
            multiple
          />
        </div>
      </v-form>
    </template>

    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false)"
      >
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn
        :disabled="!actionPermitted || !formIsDirty"
        :loading="creatingUnit || updatingUnit"
        color="primary"
        variant="text"
        @click="createUnit"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash';
import { useQueryClient } from '@tanstack/vue-query';

import { getEntityDetailsFromLink, getFirstDomainDomaindId } from '~/lib/utils';
import domainQueryDefinitions, { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useRules } from '~/composables/utils';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~~/composables/api/utils/query';
import { IVeoLink } from '~/types/VeoTypes';

const props = withDefaults(defineProps<{
  modelValue: boolean,
  unitId?: string
}>(), {
  modelValue: false,
  unitId: undefined
});

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const router = useRouter();
const { requiredRule } = useRules();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();
const queryClient = useQueryClient();
const { createLink } = useCreateLink();

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (props.unitId && props.unitId === unit.value?.id) {
      unitDetails.name = unit.value?.name;
      unitDetails.description = unit.value?.description;
      unitDetails.domains = cloneDeep(unit.value?.domains || []);
    } else {
      unitDetails.name = undefined;
      unitDetails.description = undefined;
      unitDetails.domains = domains.value?.map((domain) => createLink('domains', domain.id)) || [];
    }
    if (form.value) {
      form.value.resetValidation();
    }
  }
});

const actionPermitted = computed(() => ability.value.can('manage', 'units') && !!formIsValid.value && unitDetails.domains.length);

// Everything unit related
const fetchUnitQueryParams = computed(() => ({ id: props.unitId as string }));
const fetchUnitQueryEnabled = computed(() => !!props.unitId);
const { data: unit } = useQuery(unitQueryDefinitions.queries.fetch, fetchUnitQueryParams, {
  enabled: fetchUnitQueryEnabled
});
watch(() => unit.value, (newValue) => {
  if (newValue) {
    unitDetails.name = newValue.name;
    unitDetails.description = newValue.description;
    unitDetails.domains = cloneDeep(newValue.domains);
  }
});

const form = ref();
const formIsValid = ref(false);
const formIsDirty = computed(() => !isEqual(unitDetails, {
  name: unit.value?.name,
  description: unit.value?.description,
  domains: unit.value?.domains
}));
const unitDetails = reactive<{
  name: string | undefined,
  description: string | undefined
  domains: IVeoLink[]
}>({ name: undefined, description: undefined, domains: [] });
watch(() => unitDetails, () => {
  if (form.value) {
    form.value.validate();
  }
}, { deep: true });

const { mutateAsync: create, isLoading: creatingUnit, data: unitDetailsPayload } = useMutation(unitQueryDefinitions.mutations.create);
const { mutateAsync: update, isLoading: updatingUnit } = useMutation(unitQueryDefinitions.mutations.update);
const createUnit = async () => {
  if (!actionPermitted.value) {
    return;
  }
  try {
    if (props.unitId) {
      await update({ ...unitDetails, id: props.unitId });
      displaySuccessMessage(t('unitUpdated'));
      emit('update:model-value', false);
    } else {
      await create(unitDetails);
      displaySuccessMessage(t('unitCreated'));
      emit('update:model-value', false);
      const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: unitDetailsPayload.value?.resourceId as string }, queryClient);
      const domainId = getFirstDomainDomaindId(unit);

      if (domainId) {
        router.push({
          name: 'unit-domains-domain',
          params: {
            unit: unit.id,
            domain: domainId
          }
        });
      }
    }
  } catch (error: any) {
    displayErrorMessage(t('createUnitError'), error.message);
  }
};

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains, undefined, {
  onSuccess: (data) => {
    unitDetails.domains = (data as IVeoDomain[]).map((domain) => createLink('domains', domain.id));
  }
});
const availableDomains = computed(() => domains.value?.map((domain) => ({
  title: domain.name,
  subtitle: domain.description,
  value: domain.id
})) ?? []);
const selectedDomains = computed({
  get: () => unitDetails.domains.map((domain) => getEntityDetailsFromLink(domain).id),
  set: (newValue) => {
    unitDetails.domains = newValue.map((domainId) => createLink('domains', domainId));
  }
});
</script>

<i18n>
{
  "en": {
    "createUnit": "Create Unit",
    "createUnitError": "Couldn't create Unit",
    "description": "Description",
    "domainselection": "Domain selection",
    "editUnit": "Edit Unit",
    "name": "Name",
    "unitCreated": "New unit was created successfully",
    "unitUpdated": "Unit was updated successfully"
  },
  "de": {
    "createUnit": "Unit erstellen",
    "createUnitError": "Unit konnte nicht erstellt werden",
    "description": "Beschreibung",
    "domainselection": "Domain-Auswahl",
    "editUnit": "Unit bearbeiten",
    "name": "Name",
    "unitCreated": "Unit wurde erfolgreich erstellt",
    "unitUpdated": "Unit wurde erfolgreich aktualisiert"
  }
}
</i18n>
