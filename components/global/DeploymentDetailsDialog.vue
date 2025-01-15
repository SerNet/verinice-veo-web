<!--
   - verinice.veo web
   - Copyright (C) 2023 Jonas Heitmann Frank Schneider
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
  <BaseDialog v-bind="$attrs" :title="t('about')" large>
    <v-tabs v-model="tab" align-tabs="start" grow>
      <v-tab value="product">
        {{ t('productinfo') }}
      </v-tab>

      <v-tab value="version">
        {{ t('versioninfo') }}
      </v-tab>
    </v-tabs>

    <LayoutAppLogoDesktop class="d-flex logo-size ml-4 mt-4 mb-6" />

    <v-window v-model="tab">
      <v-window-item value="product">
        <BaseCard class="mt-0">
          <v-card-text>
            <span>{{ t('version.header') }}</span
            ><br /><br />

            <p>{{ t('version.paragraph.1') }}</p
            ><br />
            <p>{{ t('version.paragraph.2') }}</p
            ><br />
            <p>{{ t('version.paragraph.3') }}</p>

            <div class="mt-6 text-center">
              &copy; {{ currentYear }} &hyphen;
              <a href="https://www.sernet.de" rel="noopener noreferrer" target="_blank"> SerNet GmbH </a>
              &hyphen;&nbsp; Es gelten
              <a :href="privacyPolicyLink" rel="noopener noreferrer" target="_blank">{{ t('privacyPolicy') }}</a>
              {{ locale === 'de' ? 'und' : 'and' }}
              <a :href="imprintLink" rel="noopener noreferrer" target="_blank">{{ t('imprint') }}</a>
              der SerNet GmbH.
            </div>
          </v-card-text>
        </BaseCard>
      </v-window-item>

      <v-window-item value="version">
        <BaseCard class="mt-0">
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>{{ t('component') }}</th>
                <th>{{ t('build') }}</th>
                <th>{{ t('commit') }}</th>
                <th>{{ t('buildDate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deployment, index) of deploymentInformation" :key="index">
                <td>
                  {{ deployment?.build?.name || t('unknown') }}
                </td>
                <td v-if="deployment?.build?.version && deployment?.build?.ci?.buildnumber">
                  {{ deployment.build.version }} ({{ t('build') }} {{ deployment.build.ci.buildnumber }})
                </td>
                <td v-else>
                  {{ t('unknown') }}
                </td>
                <td>
                  {{ deployment?.git?.commit?.id || t('unknown') }}
                </td>
                <td v-if="deployment?.build?.time">
                  {{ new Date(deployment.build.time).toLocaleString(locale) }}
                </td>
                <td v-else>
                  {{ t('unknown') }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider />
          <div class="mt-4 text-center">
            <span>{{ t('contributors') }}:</span>&nbsp;

            <span v-for="(link, key, index) in links" :key="index">
              <a class="text-decoration-none text-primary" :href="link" rel="noopener noreferrer" target="_blank">
                veo-{{ key }}&nbsp;&nbsp;
              </a>
            </span>
          </div>
        </BaseCard>
      </v-window-item>
    </v-window>
  </BaseDialog>
</template>

<script setup lang="ts">
import monitoringQueryDefintions, { IVeoDeploymentInformation } from '~/composables/api/queryDefinitions/monitoring';
import { useQuery } from '~/composables/api/utils/query';

const config = useRuntimeConfig();
const { t, locale } = useI18n();

const fetchDefaultApiDeploymentDetailsQueryParameters = ref({
  api: 'default' as 'default' | 'history' | 'forms' | 'reporting'
});
const { data: defaultApiDeploymentDetails } = useQuery(
  monitoringQueryDefintions.queries.fetch,
  fetchDefaultApiDeploymentDetailsQueryParameters
);
const fetchFormsApiDeploymentDetailsQueryParameters = ref({
  api: 'forms' as 'default' | 'history' | 'forms' | 'reporting'
});
const { data: formsApiDeploymentDetails } = useQuery(
  monitoringQueryDefintions.queries.fetch,
  fetchFormsApiDeploymentDetailsQueryParameters
);
const fetchHistoryApiDeploymentDetailsQueryParameters = ref({
  api: 'history' as 'default' | 'history' | 'forms' | 'reporting'
});
const { data: historyApiDeploymentDetails } = useQuery(
  monitoringQueryDefintions.queries.fetch,
  fetchHistoryApiDeploymentDetailsQueryParameters
);
const fetchReportingApiDeploymentDetailsQueryParameters = ref({
  api: 'reporting' as 'default' | 'history' | 'forms' | 'reporting'
});
const { data: reportingApiDeploymentDetails } = useQuery(
  monitoringQueryDefintions.queries.fetch,
  fetchReportingApiDeploymentDetailsQueryParameters
);
const fetchAccountingApiDeploymentDetailsQueryParameters = ref({
  api: 'accounts' as 'default' | 'history' | 'forms' | 'reporting' | 'accounts'
});
const { data: accountingApiDeploymentDetails } = useQuery(
  monitoringQueryDefintions.queries.fetch,
  fetchAccountingApiDeploymentDetailsQueryParameters
);

const tab = ref(null);

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

const links = {
  webapp: 'https://github.com/SerNet/verinice-veo-web/graphs/contributors',
  rest: 'https://github.com/SerNet/verinice-veo/graphs/contributors',
  forms: 'https://github.com/SerNet/verinice-veo-forms/graphs/contributors',
  history: 'https://github.com/SerNet/verinice-veo-history/graphs/contributors',
  reporting: 'https://github.com/SerNet/verinice-veo-reporting/graphs/contributors',
  accounts: 'https://github.com/SerNet/verinice-veo-accounts/graphs/contributors'
};

const date = new Date();
const currentYear = date.getFullYear();

const imprintLink = computed(() =>
  locale.value === 'de' ? 'https://www.sernet.de/impressum' : 'https://www.sernet.de/en/imprint'
);
const privacyPolicyLink = computed(() =>
  locale.value === 'de' ? 'https://www.sernet.de/datenschutz' : 'https://www.sernet.de/privacy'
);
</script>

<i18n>
{
  "en": {
    "about": "About verinice",
    "build": "Build",
    "buildDate": "Build date",
    "commit": "Commit",
    "component": "Component",
    "contributors": "Contributors",
    "imprint": "Imprint",
    "privacyPolicy": "Privacy policy",
    "productinfo": "Product information",
    "unknown": "unknown",
    "version": {
      "header": "verinice is the open source framework for integrated management systems.",
      "paragraph": {
        "1": "The new verinice generation is completely web-based. It combines many years of experience with advanced technology. Continuous development and customer orientation remain a priority.",
        "2": "The modular approach goes beyond proven ISMS and DSMS solutions: The underlying, cross-industry expertise is a universal basis for further management systems.        verinice thus addresses the diverse requirements of organizations and authorities. As an efficient and adaptable tool, it is suitable for for beginners to get started in an uncomplicated way as well as for the complex procedure of professionals.",
        "3": "The publisher of verinice is SerNet GmbH, with more than 25 years of experience in the in the IT security industry."
      }
    },
    "versioninfo": "Version information"
  },
  "de": {
    "about": "Über verinice",
    "build": "Build",
    "buildDate": "Build-Datum",
    "commit": "Commit",
    "component": "Komponente",
    "contributors": "Beiträge",
    "imprint": "Impressum",
    "privacyPolicy": "Datenschutzerklärung",
    "productinfo": "Produktinformation",
    "unknown": "unbekannt",
    "version": {
      "header": "verinice ist das Open-Source Framework für integrierte Management-Systeme.",
      "paragraph": {
        "1": "Die neue verinice-Generation ist vollständig webbasiert. Sie vereint langjährige Erfahrung mit fortschrittlicher Technologie. Kontinuierliche Entwicklung und Kundenorientierung haben weiterhin Priorität.",
        "2": "Der modulare Ansatz geht über bewährte ISMS- und DSMS-Lösungen hinaus: Die zugrundeliegende, branchenübergreifende Expertise ist universale Basis für weitere Management-Systeme. verinice adressiert dadurch die vielfältigen Anforderungen an Organisationen und Behörden. Als effizientes und anpassungsfähiges Werkzeug eignet es sich zum unkomplizierten Loslegen für Einsteiger ebenso wie für das komplexe Vorgehen von Profis.",
        "3": "Herausgeberin von verinice ist die SerNet GmbH mit mehr als 25 Jahren Erfahrung in der IT-Security-Branche."
      }
    },
    "versioninfo": "Versionsinformation"
  }
}
</i18n>

<style lang="scss" scoped>
.logo-size {
  height: 25%;
  width: 25%;
}
</style>
