<!--
   - verinice.veo web
   - Copyright (C) 2023 jae
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
  <BasePage style="height: 100vh">
    <template #header>
      <p class="mt-6 mb-4 text-body-1">
        {{ t('hint') }}
      </p>
    </template>

    <template #default>
      <BaseCard id="profileStyleScope">
        <v-data-table
          :headers="headers"
          :items="profiles"
          item-value="id"
          items-per-page="5"
          show-select
          select-strategy="single"
          :model-value="state.selectedProfiles"
          @update:model-value="(newVal) => selectNewItem(newVal)"
        />
      </BaseCard>

      <!-- Table actions -->
      <v-row dense class="mt-4">
        <v-spacer />
        <v-col cols="auto" class="justify-end">
          <v-btn
            flat
            color="primary"
            data-veo-test="profiles-btn-apply"
            :disabled="!state.selectedProfiles[0]"
            @click="toggleDialog"
          >
            {{ t('applyBtn') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import { useProfiles } from '~/components/profile/profiles';
const { state, profiles, toggleDialog, updateDomainId } = useProfiles();
const { t } = useI18n();

// Table setup
const headers = computed(() => [
  { title: t('thName'), align: 'start', key: 'name' },
  {
    title: t('thDescription'),
    align: 'start',
    key: 'description',
    sortable: false
  },
  { title: t('thLanguage'), align: 'start', key: 'language' }
]);

// Make sure to allways write currently active domain into state
onMounted(() => updateDomainId());

function selectNewItem(val: string[]) {
  /*******************
   * THIS IS A WORK AROUND (JS + CSS):
   * In this table we only want to be able to select one item (profile) at a time.
   * At the time of writing, vuetify 3 v-data-table's `select-strategy='single'` did not work as expected (still part of vuetify LAB).
   * Once it does, TODO:
   * => on the component: use `v-model` instead of `model-value` + `@update`
   * => remove CSS (#profileStyleScope ...)
   * => remove this code:
   *******************/
  if (val.length >= 2) val.shift();
  state.selectedProfiles = val;

  // Use the profile's name prop as a default name
  const profileObj = profiles.value.filter((profile) => profile.id === state.selectedProfiles[0])[0];
  state.newUnitName = profileObj?.name || '';
}
</script>

<i18n src="./messages.json"></i18n>

<style>
/* Do not show a checkbox in table header */
#profileStyleScope th .v-selection-control__wrapper {
  display: none;
}
</style>
