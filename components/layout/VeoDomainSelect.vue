<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <!-- Current domain -->
  <div>
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          outlined
          color="primary"
          v-on="on"
        >
          <span v-if="$route.name === 'unit-domains-more'">
            {{ $t('breadcrumbs.more_modules') }}
          </span>
          <span v-else>
            {{ currentDomainName }}
          </span>
          <v-icon
            right
            dark
          >
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>
      <template #default>
        <v-list>
          <v-list-item-group
            :value="currentDomainId"
            color="primary"
          >
            <v-list-item
              v-for="(domain) in domains"
              :key="domain.id"
              :value="domain.id"
              @click="onDomainChange(domain.id)"
            >
              <v-list-item-title>{{ domain.name }}</v-list-item-title>
            </v-list-item>
            <v-divider class="mt-6" />
            <v-list-item
              value="more"
              :to="`/${$route.params.unit}/domains/more`"
            >
              {{ $t('breadcrumbs.more_modules') }}
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </template>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { separateUUIDParam, createUUIDUrlParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      domains: [] as IVeoDomain[]
    };
  },
  async fetch() {
    this.domains = await this.$api.domain.fetchAll();
  },
  computed: {
    currentDomainId(): string | undefined {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    currentDomainName(): string {
      return this.domains.find((domain) => domain.id === this.domainId)?.name || '';
    },
    currentUnitId(): string | undefined {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    domainId() {
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
    onDomainChange(domainId: string) {
      this.$router.push(`/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}`);
    }
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
