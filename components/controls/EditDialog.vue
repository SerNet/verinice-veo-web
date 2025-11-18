<!--
   - verinice.veo web
   - Copyright (C) 2024 Frank Schneider
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation,
   - either version 3 of the License, or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="showDialog"
    :title="dialogTitle"
    large
    v-bind="$attrs"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div class="mx-3">
        <v-row class="my-2 ml-8">
          <v-col
            ><strong>{{ controlAbbreviation }} {{ controlName }}</strong></v-col
          >
        </v-row>

        <v-form v-model="formIsValid">
          <v-row class="mt-2">
            <v-col>
              <v-select v-model="person" clearable :items="personNames" :label="t('responsible')" variant="solo-filled">
                <template #prepend>
                  <v-icon :icon="mdiAccount"/>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-spacer />
          <v-row>
            <v-col>
              <v-textarea
                v-model="description"
                auto-grow
                :label="t('description')"
                name="description"
                :prepend-icon="mdiPencil"
                variant="solo-filled"
              />
            </v-col>
          </v-row>
        </v-form>
      </div>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn color="primary" :disabled="!formIsValid || !formIsDirty" variant="text" @click="updateControl()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiAccount, mdiPencil } from '@mdi/js';

import { cloneDeep, isEqual } from 'lodash';

import type { IVeoFetchPersonsInDomainParameters } from '~/composables/api/queryDefinitions/domains';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';

import { useCreateLink } from '~/composables/VeoObjectUtilities';

const { mutateAsync: update } = useMutation(objectQueryDefinitions.mutations.updateObject);

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const props = withDefaults(
  defineProps<{
    controlIndex: number;
    object: Record<string, any>;
    showDialog: boolean;
  }>(),
  {
    controlIndex: 0,
    object: undefined,
    showDialog: false
  }
);
const { data: currentDomain } = useCurrentDomain();

const dialogTitle = computed(() => {
  const controlSubType = props.object?.controlImplementations?.[props.controlIndex]?.control?.subType;

  if (controlSubType) {
    const translation =
      currentDomain.value?.raw?.elementTypeDefinitions['control']?.translations[locale.value]?.[
        `control_${controlSubType}_singular`
      ];
    if (translation) {
      return t('title', [translation]);
    }
  }

  const complianceControlSubTypes =
    currentDomain.value?.raw?.controlImplementationConfiguration?.complianceControlSubTypes;
  if (complianceControlSubTypes?.length === 1) {
    const singleSubType = complianceControlSubTypes[0];
    const translation =
      currentDomain.value?.raw?.elementTypeDefinitions['control']?.translations[locale.value]?.[
        `control_${singleSubType}_singular`
      ];
    if (translation) {
      return t('title', [translation]);
    }
  }

  return t('title', ['Control']);
});

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void;
}>();

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const route = useRoute();
const { createLink } = useCreateLink();

const domainId = computed(() => route.params.domain);
const unitId = computed(() => route.params.unit);

const copy = ref(cloneDeep(props.object));

const formIsValid = ref<boolean>(false);
const formIsDirty = computed(() => !isEqual(props.object, copy.value));

const queryParams = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: domainId.value as string,
  unitId: unitId.value as string
}));

const { data: persons } = useQuery(domainQueryDefinitions.queries.fetchPersonsInDomain, queryParams, {
  enabled: !!domainId.value && !!unitId.value
});

const controlAbbreviation = computed(
  () => props.object?.controlImplementations[props.controlIndex].control.abbreviation
);

const controlName = computed(() => props.object?.controlImplementations[props.controlIndex].control.name);

const personNames = computed(() =>
  persons.value?.items?.map((person: any) => ({ title: person.name, value: person.id }))
);

const updateControl = async () => {
  try {
    await update({
      domain: domainId.value,
      endpoint: route.params.objectType,
      id: copy.value.id,
      object: copy.value
    });

    displaySuccessMessage(t('controlUpdate').toString());
  } catch (error: any) {
    displayErrorMessage(t('controlUpdateFailed').toString(), error.message);
  } finally {
    emit('update:model-value', false);
  }
};

const person = computed({
  get: () => copy.value.controlImplementations[props.controlIndex]?.responsible?.id,
  set: (newPerson) => {
    copy.value.controlImplementations[props.controlIndex].responsible =
      newPerson !== null ? createLink('persons', newPerson) : undefined;
  }
});

const description = computed({
  get: () => copy.value.controlImplementations[props.controlIndex]?.description || '',
  set: (newDescription) =>
    (copy.value.controlImplementations[props.controlIndex].description = newDescription === '' ? null : newDescription)
});

watch(props, () => {
  copy.value = cloneDeep(props.object);
});
</script>

<i18n src="~/locales/base/components/controls-edit-dialog.json"></i18n>
