<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Philipp Ballhausen, Davit Svandize, Jonas Heitmann
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
  <BasePage
    :title="$t('breadcrumbs.index')"
    data-component-name="unit-selection-page"
  >
    <div class="d-flex justify-center">
      <BaseCard
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-text>
          <h3 class="text-h4">
            {{ t('unitpicker') }}
          </h3>
        </v-card-text>
        <v-list
          lines="two"
          data-component-name="unit-selection-available-units"
        >
          <template v-if="unitsFetching">
            <div
              v-for="i in 2"
              :key="i"
              class="mb-4"
            >
              <VSkeletonLoader
                type="text"
                width="150px"
                class="mx-4 my-1"
              />
              <VSkeletonLoader
                type="text"
                width="250px"
                class="mx-4 my-1"
              />
            </div>
          </template>
          <v-list-item
            v-for="unit in units"
            v-else
            :key="unit.id"
            lines="two"
            :title="unit.name"
            :subtitle="unit.description"
            :disabled="!generateUnitDashboardLink(unit.id)"
            :to="generateUnitDashboardLink(unit.id)"
          >
            <template #append>
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="mdiTrashCanOutline"
                    variant="text"
                    data-component-name="unit-selection-delete-unit-button"
                    :disabled="unit.name === 'Demo'"
                    @click.prevent="deleteUnit(unit)"
                  />
                </template>
                <template #default>
                  {{ t('deleteUnit') }}
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
      </BaseCard>
    </div>
    <WelcomeDialog v-model="showWelcomeDialog" />
    <UnitDeleteDialog
      v-model="deleteUnitDialogVisible"
      :unit="unitToDelete"
    />
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<script lang="ts" setup>
import { StorageSerializers, useStorage } from '@vueuse/core';
import { mdiTrashCanOutline } from '@mdi/js';

import { useVeoUser } from '~/composables/VeoUser';
import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import { IVeoAPIMessage, IVeoDomain, IVeoUnit } from '~/types/VeoTypes';
import { useFetchUnits, useCreateUnit } from '~/composables/api/units';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { useRequest } from '~/composables/api/utils/request';
import { useFetchUnitDomains } from '~~/composables/api/domains';

const { profile, userSettings } = useVeoUser();
const router = useRouter();
const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { request } = useRequest();

useHead({
  title: $t('breadcrumbs.index')
});

const firstSetpsCompleted = useStorage(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED, false, localStorage, { serializer: StorageSerializers.boolean });

const showWelcomeDialog = computed({
  get: () => !firstSetpsCompleted.value,
  set: (newValue) => { firstSetpsCompleted.value = !newValue; }
});

const redirectIfTwoUnits = async () => {
  // Only applicable if the user has only two units (one demo and one main)
  if (userSettings.value.maxUnits !== 2) {
    return;
  }
  const nonDemoUnits: IVeoUnit[] = units.value.filter((unit: IVeoUnit) => unit.name !== 'Demo');
  const myNonDemoUnit = nonDemoUnits.find((unit) => unit.createdBy === profile.value?.username);

  // Auto-redirect the user to his non demo unit upon visting the app. If it doesn't exist, create it and then redirect
  if (nonDemoUnits.length > 0) {
    // Try redirecting the user to the first unit found that was created by him, else redirect him to a unit created by someone else.
    const unitToRedirectTo = myNonDemoUnit ?? nonDemoUnits[0];

    if (unitToRedirectTo) {
      const domainId = getFirstDomainDomaindId(unitToRedirectTo);

      if (domainId) {
        await router.push({
          name: 'unit-domains-domain',
          params: {
            unit: createUUIDUrlParam('unit', unitToRedirectTo.id),
            domain: createUUIDUrlParam('domain', domainId)
          }
        });
      }
    }
  } else {
    await createUnitAndRedirect({
      name: 'Unit 1',
      description: t('firstUnitDescription')
    });
  }
};

const redirectToNewUnit = async (data: IVeoAPIMessage) => {
  const unit = await request<IVeoUnit>('/api/units/:id', { params: { id: data.resourceId } });
  const domainId = getFirstDomainDomaindId(unit);

  if (domainId) {
    router.push({
      name: 'unit-domains-domain',
      params: {
        unit: createUUIDUrlParam('unit', unit.id),
        domain: createUUIDUrlParam('domain', domainId)
      }
    });
  }
};

const { data: units, isFetching: unitsFetching } = useFetchUnits({ onSuccess: redirectIfTwoUnits });

const { mutateAsync: createUnitAndRedirect } = useCreateUnit({ onSuccess: redirectToNewUnit });

const generateUnitDashboardLink = (unitId: string) => {
  const unitToLinkTo = units.value.find((unit) => unit.id === unitId);
  let domainId;

  if (unitToLinkTo) {
    domainId = getFirstDomainDomaindId(unitToLinkTo);
  }

  return unitToLinkTo && domainId ? `/${createUUIDUrlParam('unit', unitToLinkTo.id)}/domains/${createUUIDUrlParam('domain', domainId)}` : undefined;
};

// Navigation helper (auto redirect to unit the user was previously in if he accessed the index page as entry point)
const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, { serializer: StorageSerializers.string });
const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, { serializer: StorageSerializers.string });
const fetchUnitDomainsQueryParameters = computed(() => ({ unitId: lastUnit.value }));
const fetchUnitDomainsQueryEnabled = computed(() => !!lastUnit.value && lastUnit.value !== 'undefined' && !!lastDomain.value && lastDomain.value !== 'undefined' && router.options.history.state.position === 1);
useFetchUnitDomains(fetchUnitDomainsQueryParameters, { enabled: fetchUnitDomainsQueryEnabled, onSuccess: (domains: IVeoDomain[]) => {
  if (userSettings.value.maxUsers <= 2 && domains.find((domain) => domain.id === lastDomain.value)) {
    navigateTo({
      name: 'unit-domains-domain',
      params: {
        unit: createUUIDUrlParam('unit', lastUnit.value),
        domain: createUUIDUrlParam('domain', lastDomain.value)
      }
    });
  } else {
    // If the domain doesn't exist, the last unit & domain are outdated, so we remove them
    lastUnit.value = undefined;
    lastDomain.value = undefined;
  }
}});

// Unit deletion stuff
const deleteUnitDialogVisible = ref(false);
const unitToDelete = ref<undefined | IVeoUnit>();
const deleteUnit = (unit: IVeoUnit) => {
  unitToDelete.value = unit;
  deleteUnitDialogVisible.value = true;
};
</script>

<i18n>
{
  "en": {
    "deleteUnit": "Delete unit",
    "firstUnitDescription": "This is your first unit",
    "unitpicker": "Please choose a unit",
    "unitpickerPlaceholder": "Search for a unit..."
  },
  "de": {
    "deleteUnit": "Unit löschen",
    "firstUnitDescription": "Dies ist ihre erste Unit",
    "unitpicker": "Bitte wählen Sie eine Unit",
    "unitpickerPlaceholder": "Nach einer Unit suchen..."
  }
}
</i18n>
