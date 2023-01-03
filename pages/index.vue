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
  <VeoPage
    :title="t('breadcrumbs.index')"
    data-component-name="unit-selection-page"
  >
    <div class="text-body-1 my-4">
      {{ t('unitpicker') }}
    </div>
    <div class="d-flex justify-center">
      <VeoCard style="width: 70%; max-width: 1000px;">
        <v-data-iterator
          :search="search"
          :items="units"
          item-key="id"
        >
          <template #header>
            <div data-component-name="unit-selection-search">
              <v-text-field
                v-model="search"
                dense
                clearable
                filled
                hide-details
                color="black"
                prepend-inner-icon="mdi-magnify"
                :label="t('unitpickerPlaceholder')"
              />
            </div>
            <v-progress-linear
              v-if="unitsFetching"
              indeterminate
            />
          </template>
          <template #default="{ items }">
            <v-list
              dense
              data-component-name="unit-selection-available-units"
            >
              <v-list-item
                v-for="item in items"
                :key="item.id"
                two-line
                :disabled="!generateUnitDashboardLink(item.id)"
                :to="generateUnitDashboardLink(item.id)"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="item.name" />
                  <v-list-item-subtitle v-text="item.description" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </template>
        </v-data-iterator>
      </VeoCard>
    </div>
    <VeoWelcomeDialog
      v-if="showWelcomeDialog"
      v-model="showWelcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<script lang="ts" setup>
import { useVeoUser } from '~/composables/VeoUser';
import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import { IVeoAPIMessage, IVeoUnit } from '~/types/VeoTypes';
import { useFetchUnits, useCreateUnit } from '~/composables/api/units';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { FIRST_STEPS_COMPLETED } from '~/util/LocalStorage';
import { useRequest } from '~~/composables/api/utils/request';

const { profile, userSettings } = useVeoUser();
const router = useRouter();
const { t } = useI18n();
const { request } = useRequest();

const search = ref<string | undefined>(undefined);

const showWelcomeDialog = useStorage(FIRST_STEPS_COMPLETED, false, localStorage, { serializer: StorageSerializers.boolean });

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
</script>

<i18n>
{
  "en": {
    "firstUnitDescription": "This is your first unit",
    "unitpicker": "Please choose a unit",
    "unitpickerPlaceholder": "Search for a unit..."
  },
  "de": {
    "firstUnitDescription": "Dies ist ihre erste Unit",
    "unitpicker": "Bitte wählen Sie eine Unit",
    "unitpickerPlaceholder": "Nach einer Unit suchen..."
  }
}
</i18n>
