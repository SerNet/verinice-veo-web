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
  <VeoDialog
    v-bind="$attrs"
    :headline="$t('environmentInformation')"
    large
    v-on="$listeners"
  >
    <v-simple-table dense>
      <thead>
        <tr>
          <th>
            {{ $t('component') }}
          </th>
          <th>
            {{ $t('build') }}
          </th>
          <th>
            {{ $t('commit') }}
          </th>
          <th>
            {{ $t('buildDate') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(deployment, index) of deployments"
          :key="index"
        >
          <td v-if="deployment && deployment.build && deployment.build.name">
            {{ deployment.build.name }}
          </td>
          <td v-else>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </td>
          <td v-if="deployment && deployment.build">
            {{ deployment.build.version }} ({{ $t('build') }} {{ deployment.build.ci.buildnumber }})
          </td>
          <td v-else>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </td>
          <td v-if="deployment && deployment.git && deployment.git.commit">
            {{ deployment.git.commit.id }}
          </td>
          <td v-else>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </td>
          <td v-if="deployment && deployment.build">
            {{ new Date(deployment.build.time).toLocaleString($i18n.locale) }}
          </td>
          <td v-else>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { IVeoDeploymentInformation } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      deployments: {
        app: undefined as undefined | any,
        default: undefined as undefined | IVeoDeploymentInformation,
        forms: undefined as undefined | IVeoDeploymentInformation,
        history: undefined as undefined | IVeoDeploymentInformation,
        reports: undefined as undefined | IVeoDeploymentInformation
      }
    };
  },
  watch: {
    '$attrs.value'(newValue: boolean) {
      // We only load the deployment information if the user clicks on the dialog to avoid too many requests
      if (newValue && this.deployments.app === undefined) {
        this.fetchDeploymentDetails();
      }
    }
  },
  methods: {
    async fetchDeploymentDetails() {
      this.deployments.app = {
        git: {
          commit: {
            id: this.$config.build
          }
        },
        build: {
          name: 'webapp',
          ci: {
            buildnumber: this.$config.buildNumber
          },
          version: this.$config.version,
          time: this.$config.commitTimestamp
        }
      };

      this.deployments.default = await this.$api.monitoring.fetchDeploymentDetails('default');
      this.deployments.forms = await this.$api.monitoring.fetchDeploymentDetails('forms');
      this.deployments.history = await this.$api.monitoring.fetchDeploymentDetails('history');
      this.deployments.reports = await this.$api.monitoring.fetchDeploymentDetails('reporting');
    }
  }
});
</script>

<i18n>
{
  "en": {
    "build": "Build",
    "buildDate": "Build date",
    "commit": "Commit",
    "component": "Component",
    "environmentInformation": "Product information"
  },
  "de": {
    "build": "Build",
    "buildDate": "Build Datum",
    "commit": "Commit",
    "component": "Komponente",
    "environmentInformation": "Produktinformationen"
  }
}
</i18n>

<style lang="scss" scoped>
.v-data-table {
  background-color: transparent !important;
}
</style>