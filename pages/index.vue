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
  <VeoPage :title="$t('breadcrumbs.index')">
    <div class="text-body-1 my-4">
      {{ $t('unitpicker') }}
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
                :label="$t('unitpickerPlaceholder')"
              />
            </div>
            <v-progress-linear
              v-if="$fetchState.pending"
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
import Vue from 'vue';

import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import { IVeoUnit } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';

export const ROUTE_NAME = 'index';

export default Vue.extend({
  name: 'VeoUnitSelectionPage',
  data() {
    return {
      search: '',
      unit: '',
      units: [] as IVeoUnit[],
      showWelcomeDialog: false as boolean
    };
  },
  async fetch() {
    const units = await this.$api.unit.fetchAll();

    // Only applicable if the user has only two units (one demo and one main)
    if (this.maxUnits === 2) {
      const nonDemoUnits: IVeoUnit[] = units.filter((unit: IVeoUnit) => unit.name !== 'Demo');
      const myNonDemoUnit = nonDemoUnits.find((unit) => unit.createdBy === this.$user.auth.profile?.username);

      // Auto-redirect the user to his non demo unit upon visting the app. If it doesn't exist, create it and then redirect
      if (nonDemoUnits.length > 0) {
        // Try redirecting the user to the first unit found that was created by him, else redirect him to a unit created by someone else.
        const unitToRedirectTo = myNonDemoUnit ?? nonDemoUnits[0];

        if (unitToRedirectTo) {
          const domainId = getFirstDomainDomaindId(unitToRedirectTo);

          if (domainId) {
            this.$router.push({
              name: 'unit-domains-domain',
              params: {
                unit: createUUIDUrlParam('unit', unitToRedirectTo.id),
                domain: createUUIDUrlParam('domain', domainId)
              }
            });
          }
        }
      } else {
        const result = await this.$api.unit.create({
          name: 'Unit 1',
          description: this.$t('firstUnitDescription')
        });
        const unit = await this.$api.unit.fetch(result.resourceId);
        const domainId = getFirstDomainDomaindId(unit);

        if (domainId) {
          this.$router.push({
            name: 'unit-domains-domain',
            params: {
              unit: createUUIDUrlParam('unit', unit.id),
              domain: createUUIDUrlParam('domain', domainId)
            }
          });
        }
      }
    }

    this.units = units;
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.index')
    };
  },
  computed: {
    maxUnits(): number | undefined {
      const maxUnits = this.$user.auth.profile?.attributes?.maxUnits?.[0];

      return maxUnits ? parseInt(maxUnits, 10) : maxUnits;
    }
  },
  mounted() {
    this.showWelcomeDialog = !LocalStorage.firstStepsCompleted;
  },
  methods: {
    generateUnitDashboardLink(unitId: string) {
      const unitToLinkTo = this.units.find((unit) => unit.id === unitId);
      let domainId;

      if (unitToLinkTo) {
        domainId = getFirstDomainDomaindId(unitToLinkTo);
      }

      return unitToLinkTo && domainId ? `/${createUUIDUrlParam('unit', unitToLinkTo.id)}/domains/${createUUIDUrlParam('domain', domainId)}` : undefined;
    }
  }
});
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
