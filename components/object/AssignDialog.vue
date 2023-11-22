<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published bythe Free Software Foundation,
   - either version 3 of the License, or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    :title="t('title')"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div class="mx-4">
        <span class="text-h3 mt-8">
          {{ t('domainselection') }}
        </span>

        <v-list class="mt-2">
          <v-list-item
            v-for="domain of availableDomains"
            :key="domain.id"
            :subtitle="domain.description"
            :title="domain.name"
            two-line
            class="rounded mb-2 bg-accent"
          >
            <template #prepend>
              <v-icon
                :icon="mdiCheck"
                color="primary"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>

      <v-row class="ma-2">
        <v-col>
          <v-select
            v-model="selectedSubType"
            :label="t('subtype')"
            :items="subTypes"
            clearable
            variant="solo-filled"
          />
          <v-select
            label="Status"
            :items="['New', 'In progress', 'Archived']"
            :disabled="!selectedSubType"
            variant="solo-filled"
          />
        </v-col>
      </v-row>
    </template>

    <template #dialog-options>
      <v-btn
        variant="text"
        @click="emit('update:model-value', false)"
      >
        {{ $t('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn
        color="primary"
        variant="text"
        @click="assignObject()"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiCheck } from '@mdi/js';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';

import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~~/composables/api/utils/query';

const props = withDefaults(defineProps<{
  modelValue: boolean,
  objectId: string
}>(), {
  modelValue: false,
  objectId: ''
});

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>();

const { t } = useI18n();
const route = useRoute();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);
const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);

const subTypes = computed(() => Object.entries(schemas.value || {}).map(([k, _v]) => k));
const selectedSubType = ref(undefined);

const availableDomains = computed(() => domains.value?.map((domain) => ({
  abbreviation: domain.abbreviation,
  description: domain.description,
  id: domain.id,
  name: domain.name
})) ?? []);

const assignObject = async () => {
  try {
    await updateObject({ domain: route.params.domain, endpoint: route.params?.objectType, id: props.objectId });
    displaySuccessMessage(t('objectLinked').toString());
    emit('update:model-value', false);
  }
  catch (error: any) {
    displayErrorMessage(t('deletingAccountFailed').toString(), error.message);
  }
};
</script>

<i18n>
{
  "en": {
    "domainselection": "Domain selection",
    "subtype": "Subtype",
    "title": "Assign object"
  },
  "de": {
    "domainselection": "Domänenauswahl",
    "subtype": "Subtyp",
    "title": "Objekt zuordnen"
  }
}
</i18n>
