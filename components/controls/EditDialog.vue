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
    :title="t('title')"
    large
    v-bind="$attrs"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div class="mx-2">
        <v-form>
          <v-row class="mt-2">
            <v-col>
              <v-select clearable :items="personNames" :label="t('responsible')" variant="solo-filled">
                <template #prepend>
                  <v-icon :icon="mdiAccount"></v-icon>
                </template>
              </v-select>
            </v-col>
            <v-col>
              <v-select :v-model="status" clearable :items="status" :label="t('status')" variant="solo-filled">
                <template #prepend>
                  <v-icon :icon="mdiCheckCircle"></v-icon>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-spacer />
          <v-row>
            <v-col>
              <v-textarea
                auto-grow
                density="compact"
                :label="t('description')"
                :model-value="description"
                name="description"
                :prepend-icon="mdiPencil"
                variant="filled"
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
      <v-btn color="primary" variant="text" @click="updateControl()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiAccount, mdiCheckCircle, mdiPencil } from '@mdi/js';

import { cloneDeep } from 'lodash';

import domainQueryDefinitions, { IVeoFetchPersonsInDomainParameters } from '~/composables/api/queryDefinitions/domains';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';

const { mutateAsync: update } = useMutation(objectQueryDefinitions.mutations.updateObject);

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const props = withDefaults(
  defineProps<{
    object: object;
    showDialog: boolean;
  }>(),
  {
    object: undefined,
    showDialog: false
  }
);

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void;
}>();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const route = useRoute();

const description = ref<string>('');
const status = ref(['N_A', 'NO', 'PARTIAL', 'UNKNOWN', 'YES']);

const domainId = computed(() => route.params.domain);
const unitId = computed(() => route.params.unit);

const queryParams = computed<IVeoFetchPersonsInDomainParameters>(() => ({
  domainId: domainId.value as string,
  unitId: unitId.value as string
}));

const { data: persons } = useQuery(domainQueryDefinitions.queries.fetchPersonsInDomain, queryParams, {
  enabled: !!domainId.value && !!unitId.value
});
const personNames = computed(() => persons.value?.items?.map((person) => person.name));

const updateControl = async () => {
  const copy = cloneDeep(props.object);

  if (!copy) return;

  // TODO: patch copy to update control ...
  try {
    await update({
      domain: domainId.value,
      endpoint: route.params.objectType,
      id: route.params.object,
      object: copy
    });

    displaySuccessMessage(t('controlUpdate').toString());
  } catch (error: any) {
    displayErrorMessage(t('controlUpdateFailed').toString(), error.message);
  } finally {
    emit('update:model-value', false);
  }
};
</script>

<i18n>
  {
    "en": {
      "controlUpdate": "Control updated succesfully",
      "controlUpdateFailed": "Control could not be updated",
      "description": "Description",
      "responsible": "Responsible person",
      "status": "Implementation status",
      "statuses": {
        "N_A": "Not applicable",
        "NO": "No",
        "PARTIAL": "Partial",
        "UNKNOWN": "Unedited",
        "YES": "Yes"
      },
      "title": "Edit control"
    },
    "de": {
      "controlUpdate": "Baustein erfolgreich aktualisiert",
      "controlUpdateFailed": "Baustein konnte nicht aktualisiert werden",
      "description": "Beschreibung",
      "responsible": "Verantwortliche Person",
      "status": "Umsetzungsstatus",
      "statuses": {
        "N_A": "Nicht anwendbar",
        "NO": "Nein",
        "PARTIAL": "Teilweise",
        "UNKNOWN": "Unbearbeitet",
        "YES": "Ja"
      },
      "title": "Baustein editieren"
    }
  }
</i18n>
