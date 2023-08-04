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
    :title="t('environmentInformation')"
    large
  >
    <BaseCard>
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
            <td v-if="deployment?.build?.name">
              {{ deployment.build.name }}
            </td>
            <td v-else>
              <v-skeleton-loader
                type="text"
                width="100"
              />
            </td>
            <td v-if="deployment?.build?.version && deployment?.build?.ci?.buildnumber">
              {{ deployment.build.version }} ({{ t('build') }} {{ deployment.build.ci.buildnumber }})
            </td>
            <td v-else>
              <v-skeleton-loader
                type="text"
                width="100"
              />
            </td>
            <td v-if="deployment?.git?.commit?.id">
              {{ deployment.git.commit.id }}
            </td>
            <td v-else>
              <v-skeleton-loader
                type="text"
                width="100"
              />
            </td>
            <td v-if="deployment?.build?.time">
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
    </BaseCard>

    <v-divider />
    <BaseCard class="mt-4">
      <v-card-text>
        <p>{{ t('aboutText') }}</p>
        <br>
        <!-- We have to use scope global as local throws an error for some reason -->
        <i18n-t
          keypath="imprintText"
          tag="p"
          scope="global"
        >
          <a
            :href="imprintLink"
            target="_blank"
          >{{ t('imprint') }}</a>
        </i18n-t>
        <i18n-t
          keypath="privacyPolicyText"
          tag="p"
          scope="global"
        >
          <a
            :href="privacyPolicyLink"
            target="_blank"
          >{{ t('privacyPolicy') }}</a>
        </i18n-t>
        <br>
        &copy; {{ currentYear }} - <a
          href="https://www.sernet.de"
          target="_blank"
        >SerNet GmbH</a>
      </v-card-text>
    </BaseCard>
  </BaseDialog>
</template>

<script setup lang="ts">
import monitoringQueryDefintions, { IVeoDeploymentInformation } from '~/composables/api/queryDefinitions/monitoring';
import { useQuery } from '~~/composables/api/utils/query';

const config = useRuntimeConfig();
const { t, locale } = useI18n();

const fetchDefaultApiDeploymentDetailsQueryParameters = ref({ api: 'default' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: defaultApiDeploymentDetails } = useQuery(monitoringQueryDefintions.queries.fetch, fetchDefaultApiDeploymentDetailsQueryParameters);
const fetchFormsApiDeploymentDetailsQueryParameters = ref({ api: 'forms' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: formsApiDeploymentDetails } = useQuery(monitoringQueryDefintions.queries.fetch, fetchFormsApiDeploymentDetailsQueryParameters);
const fetchHistoryApiDeploymentDetailsQueryParameters = ref({ api: 'history' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: historyApiDeploymentDetails } = useQuery(monitoringQueryDefintions.queries.fetch, fetchHistoryApiDeploymentDetailsQueryParameters);
const fetchReportingApiDeploymentDetailsQueryParameters = ref({ api: 'reporting' as 'default' | 'history' | 'forms' | 'reporting' });
const { data: reportingApiDeploymentDetails } = useQuery(monitoringQueryDefintions.queries.fetch, fetchReportingApiDeploymentDetailsQueryParameters);
const fetchAccountingApiDeploymentDetailsQueryParameters = ref({ api: 'accounts' as 'default' | 'history' | 'forms' | 'reporting' | 'accounts' });
const { data: accountingApiDeploymentDetails } = useQuery(monitoringQueryDefintions.queries.fetch, fetchAccountingApiDeploymentDetailsQueryParameters);

const date = new Date();
const currentYear = date.getFullYear();

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
      time: config.public.buildTime
    }
  },
  default: defaultApiDeploymentDetails.value,
  forms: formsApiDeploymentDetails.value,
  history: historyApiDeploymentDetails.value,
  reports: reportingApiDeploymentDetails.value,
  accounts: accountingApiDeploymentDetails.value
}));

const imprintLink = computed(() => locale.value === 'de' ? 'https://www.sernet.de/impressum' : 'https://www.sernet.de/en/imprint');
const privacyPolicyLink = computed(() => locale.value === 'de' ? 'https://www.sernet.de/datenschutz' : 'https://www.sernet.de/privacy');
</script>

<i18n>
{
  "en": {
    "aboutText": "verinice is a software provided by SerNet GmbH, \"verinice\" and \"SerNet\" are registered trademarks of SerNet GmbH in Germany, Europe and other countries. If you have any questions about verinice, please contact us by email at sales{'@'}sernet.de. This address is also valid for technical and legal questions.",
    "build": "Build",
    "buildDate": "Build date",
    "commit": "Commit",
    "component": "Component",
    "environmentInformation": "Product information",
    "imprint": "imprint",
    "privacyPolicy": "privacy policy"
  },
  "de": {
    "aboutText": "verinice ist eine Software der SerNet GmbH, \"verinice\" und \"SerNet\" sind eingetragene Marken der SerNet GmbH in Deutschland, Europa und weiteren Ländern. Wenn Sie Fragen zu verinice haben, wenden Sie sich bitte per E-Mail an vertrieb{'@'}sernet.de. Diese Adresse gilt auch für technische und rechtliche Fragen.",
    "build": "Build",
    "buildDate": "Build-Datum",
    "commit": "Commit",
    "component": "Komponente",
    "environmentInformation": "Produktinformationen",
    "imprint": "Impressum",
    "privacyPolicy": "Datenschutzerklärung"
  }
}
</i18n>
