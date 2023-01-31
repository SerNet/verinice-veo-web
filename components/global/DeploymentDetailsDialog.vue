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
  <BaseDialog
    v-bind="$attrs"
    :headline="t('environmentInformation')"
    large
  >
    <v-table density="comfortable">
      <thead>
        <tr>
          <th>
            {{ t('component') }}
          </th>
          <th>
            {{ t('build') }}
          </th>
          <th>
            {{ t('commit') }}
          </th>
          <th>
            {{ t('buildDate') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(deployment, index) of deploymentInformation"
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
            {{ deployment.build.version }} ({{ t('build') }} {{ deployment.build.ci.buildnumber }})
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
            {{ new Date(deployment.build.time).toLocaleString(locale) }}
          </td>
          <td v-else>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { IVeoDeploymentInformation, useFetchDeploymentDetails } from '~/composables/api/monitoring';

const config = useRuntimeConfig();
const { t, locale } = useI18n();

const fetchDefaultApiDeploymentDetailsQueryParameters = ref({ api: 'default' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: defaultApiDeploymentDetails } = useFetchDeploymentDetails(fetchDefaultApiDeploymentDetailsQueryParameters);
const fetchFormsApiDeploymentDetailsQueryParameters = ref({ api: 'forms' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: formsApiDeploymentDetails } = useFetchDeploymentDetails(fetchFormsApiDeploymentDetailsQueryParameters);
const fetchHistoryApiDeploymentDetailsQueryParameters = ref({ api: 'history' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: historyApiDeploymentDetails } = useFetchDeploymentDetails(fetchHistoryApiDeploymentDetailsQueryParameters);
const fetchReportingApiDeploymentDetailsQueryParameters = ref({ api: 'reporting' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: reportingApiDeploymentDetails } = useFetchDeploymentDetails(fetchReportingApiDeploymentDetailsQueryParameters);

const deploymentInformation = computed<Record<string, IVeoDeploymentInformation | undefined>>(() => ({
  app: {
    git: {
      commit: {
        id: config.public.build
      }
    },
    build: {
      name: 'webapp',
      ci: {
        buildnumber: config.public.buildNumber
      },
      version: config.public.version,
      time: config.public.commitTimestamp
    }
  },
  default: defaultApiDeploymentDetails.value,
  forms: formsApiDeploymentDetails.value,
  history: historyApiDeploymentDetails.value,
  reports: reportingApiDeploymentDetails.value,
  accounts: undefined
}));
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
    "buildDate": "Build-Datum",
    "commit": "Commit",
    "component": "Komponente",
    "environmentInformation": "Produktinformationen"
  }
}
</i18n>
