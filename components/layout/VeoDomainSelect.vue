<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Annemarie Bufe
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
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        outlined
        color="primary"
        v-on="on"
      >
        {{ $route.name === 'unit-domains-more' ? $t('breadcrumbs.more_modules') : currentDomainName }}
        <v-icon
          right
          dark
        >
          {{ mdiChevronDown }}
        </v-icon>
      </v-btn>
    </template>
    <template #default>
      <v-list>
        <v-list-item-group
          color="primary"
        >
          <v-list-item
            v-for="(domain) in domains"
            :key="domain.id"
            :to="`${ baseUrl }${ createUUIDUrlParam('domain', domain.id) }`"
            nuxt
          >
            <v-list-item-title>{{ domain.name }}</v-list-item-title>
          </v-list-item>
          <v-divider class="mt-6" />
          <v-list-item
            value="more"
            nuxt
            :to="`/${$route.params.unit}/domains/more`"
          >
            {{ $t('breadcrumbs.more_modules') }}
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import { mdiChevronDown } from '@mdi/js';

import { separateUUIDParam, createUUIDUrlParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      domains: [] as IVeoDomain[],
      mdiChevronDown
    };
  },
  async fetch() {
    this.domains = await this.$api.domain.fetchAll();
  },
  computed: {
    baseUrl(): string {
      return `/${this.$route.params.unit}/domains/`;
    },
    currentDomainId(): string | undefined {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    currentDomainName(): string {
      return this.domains.find((domain) => domain.id === this.domainId)?.name || '';
    },
    currentUnitId(): string | undefined {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    domainId(): string | undefined {
      if (this.$route.name === 'unit-domains-more') {
        return undefined;
      }
      if (!this.currentDomainId) {
        return this.currentUnitId && this.currentUnitId === this.$user.lastUnit ? this.$user.lastDomain : undefined;
      }
      return this.currentDomainId;
    }
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<i18n>
{
  "en": {
    "noDomainSelected": "No module selected"
  },
  "de": {
    "noDomainSelected": "Kein Modul ausgewählt"
  }
}
</i18n>
