<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <div
    style="flex-basis: 0;"
    class="mr-0 text-right flex-grow-0"
  >
    <v-menu
      v-model="value"
      :close-on-content-click="false"
      max-width="350px"
      nudge-bottom="5"
      offset-y
      origin="top right"
    >
      <template #activator="{ on }">
        <v-btn
          icon
          dark
          v-on="on"
        >
          <v-avatar
            size="48"
            color="secondary"
          >
            <span class="white--text headline">{{ initials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list
          dense
          class="pb-0"
        >
          <v-list-item>
            <v-list-item-avatar color="secondary">
              <v-icon
                class="white--text"
                style="font-style: normal"
              >
                {{ initials }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>
                {{ prename }}
                {{ lastname }}
              </span>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <template v-if="!maxUnits || maxUnits > 2">
            <v-divider />
            <VeoUnitSelection :units="units" />
          </template>
          <v-divider class="mt-4" />
          <v-list-item @click="displayDeploymentDetails = true">
            <v-list-item-icon class="ml-2">
              <v-icon>
                mdi-information-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title class="font-weight-regular">
              {{ $t('about') }}
            </v-list-item-title>
            <VeoDeploymentDetailsDialog v-model="displayDeploymentDetails" />
          </v-list-item>
        </v-list>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="$emit('logout')"
          >
            {{ $t('logout') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoUnit } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    prename: { type: String, default: '' },
    lastname: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  data() {
    return {
      value: false,
      units: [] as IVeoUnit[],
      displayDeploymentDetails: false as boolean
    };
  },
  async fetch() {
    this.units = await this.$api.unit.fetchAll();
  },
  computed: {
    initials(): string {
      return this.prename.substring(0, 1) + this.lastname.substring(0, 1);
    },
    maxUnits(): number | undefined {
      const maxUnits = this.$user.auth.profile?.attributes?.maxUnits?.[0];

      return maxUnits ? parseInt(maxUnits, 10) : maxUnits;
    }
  },
  mounted() {
    this.$root.$on(VeoEvents.UNIT_CHANGED, () => {
      this.$nextTick(() => {
        this.$fetch();
      });
    });
  }
});
</script>

<i18n>
{
  "en": {
    "about": "About verinice.",
    "logout": "Logout"
  },
  "de": {
    "about": "Über verinice.",
    "logout": "Abmelden"
  }
}
</i18n>
