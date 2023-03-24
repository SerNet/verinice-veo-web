<!--
   - verinice.veo web
   - Copyright (C) 2022 SerNet
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
    :title="$t('breadcrumbs.user-data')"
    sticky-footer
  >
    <template #default>
      <i18n-t
        keypath="hint"
        tag="p"
        scope="global"
      >
        <a
          href="https://dsgvo-gesetz.de/art-20-dsgvo/"
          target="_blank"
        >{{ t('linkText') }}</a>
      </i18n-t>

      <p class="text-body-2">
        {{ t("hint") }}
        <a
          href="https://dsgvo-gesetz.de/art-20-dsgvo/"
          target="_blank"
        >{{ t('hint.para1.linkText') }}</a>
      </p>

      <v-row class="align-start">
        <v-col
          class="mt-4"
          cols="12"
          :md="12"
          :lg="12"
        >
          <!-- EXPORT UNITS -->
          <UserDataCard
            :items="state.units"
            :header="t('unitHeader')"
            :body="t('unitBody')"
            :download-btn-copy="t('buttonDownload')"
            :alert-header="t('alertHeader')"
            :alert-body="t('alertBody')"
            @export-data="exportUnitData"
          />
        </v-col>
        <v-col
          class="mt-4"
          cols="12"
          :md="12"
          :lg="6"
        >
          <!-- EXPORT ACCOUNTS -->
          <UserDataCard
            :items="[state.accounts]"
            :header="t('accountHeader')"
            :body="t('accountBody')"
            :download-btn-copy="t('buttonDownload')"
            :alert-header="t('alertHeader')"
            :alert-body="t('alertBody')"
            @export-data="exportAccountData"
          />
        </v-col>
        <v-col
          class="mt-4"
          cols="12"
          :md="12"
          :lg="6"
        >
          <!-- EXPORT DOMAIN -->
          <UserDataCard
            :items="state.domain.items"
            :header="t('domainHeader')"
            :body="t('domainBody')"
            :download-btn-copy="t('buttonDownload')"
            :alert-header="t('alertHeader')"
            :alert-body="t('alertBody')"
            @export-data="exportDomainData"
          />
        </v-col>
      </v-row>
      <v-row class="align-start">
        <v-col
          class="mt-4"
          cols="12"
          :md="12"
          :lg="6"
        >
          <!-- EXPORT HISTORY -->
          <UserDataCard
            id="historyExport"
            :items="state.history.zipArchives"
            :header="t('historyHeader')"
            :body="t('historyBody')"
            :download-btn-copy="t('buttonDownload')"
            :prepare-btn-copy="t('buttonPrepareDownload')"
            :show-download-icon="false"
            :alert-header="t('alertHeader')"
            :alert-body="t('alertBody')"
            :zip-archives="state.history.zipArchives"
            :is-loading="state.history.isLoading"
            :prepare-data="state.history.prepareData"
            @prepare-download="prepareHistoryData"
            @export-data="exportHistoryData"
          />
        </v-col>
      </v-row>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, reactive, toRaw } from "vue";
import { useFetchUnits } from "@/composables/api/units";
import { useFetchDomains } from "@/composables/api/domains";
import { useRequest } from "@/composables/api/utils/request";
import { createZIP, downloadZIP, download } from "@/lib/jsonToZip";
import { IVeoAccount } from '@/composables/api/accounts';
import { IVeoUnit } from 'types/VeoTypes';

import {chunk} from 'lodash';

const { authenticated } = useVeoUser();

interface IVeoUserDataUnit extends IVeoUnit{
  isLoading: boolean;
}

interface IVeoUserDataAccounts {
  isLoading: boolean;
  accounts: IVeoAccount[];
}

/*
interface IVeoUserDataHistory {
  isLoading: boolean,
  items:
}
*/

const { t, i18n } = useI18n();
const { request } = useRequest();
const { profile } = useVeoUser();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const state = reactive({
  test: [] as any[],
  username: profile.value?.username as string,
  units: [] as IVeoUserDataUnit[],
  domain: { isLoading: false, items: [] },
  history: {
    prepareData: true,
    isLoading: false, items: [],
    archiveName: {counter: 0, name: ''},
    zipArchives: []
  },
  accounts: { isLoading: false, accounts: [] } as IVeoUserDataAccounts
});

watch(state, () => console.log({state}));
watch(state, () => console.log('domain', state.domain));

// DOMAIN
function fetchDomainData() {
  return request(`/api/domains`, {});
}

async function exportDomainData() {
  try {
    const fileName = `${state.username}_domains`;
    const domain = await fetchDomainData();
    await downloadZIP(domain, fileName);
    state.domain.isLoading = false;
    displaySuccessMessage(t('successHeader'));
  } catch (error) {
    handleError(error);
    state.domain.isLoading = false;
  }
}

const {data: domains} = useFetchDomains();
watch(domains, () => console.log('domains to raw', domains.value));
watch(domains, () => domains.value.forEach(domain => state.domain.items.push(toRaw(domain))));
state.domain.items.push({name: 'test'});

/*
const rawDomainMeta = computed(() => {
  const rawDomains = domains.value.map((unit) => toRaw(unit));
  console.log(rawDomains)
  const test = rawDomains.map(domain => {
    let id = domain.id;
    let name = domain.name;
    return {id, name}
});
*/

// state.test = rawDomainMeta


// UNITS
// Fetch unit metadata to filter for relevant IDs (we want to export every unit but 'Demo')
const {data: units}= useFetchUnits();
const relevantUnits = computed(() => {
  if (!units) return [];
  const rawUnits = units.value.map((unit) => unit);
  const filteredUnits = rawUnits?.filter((unit: IVeoUnit) => unit.name !== "Demo");
  return filteredUnits.map((unit: IVeoUnit) => ({ ...unit, isLoading: false }));
});
state.units = relevantUnits;

// Fetch a single unit
function fetchUnitData(index: number) {
  const unitID = state.units[index].id;
  return request("/api/units/:id/export", { params: { id: unitID }});
}

// Export a single unit
async function exportUnitData(index: number) {
  state.units[index].isLoading = true;
  try {
    const unitData = await fetchUnitData(index);
    const fileName = `${state.username}_${state.units[index].name}`;
    await downloadZIP(unitData, fileName);
    state.units[index].isLoading = false;
    displaySuccessMessage(t('successHeader'));
  }
  catch (error) {
    handleError(error);
    state.units[index].isLoading = false;
  }
}

// ACCOUNTS
function fetchAccountData() {
  return request(`/api/accounts`, {});
}

async function exportAccountData() {
  state.accounts.isLoading = true;
  try {
    // Get data on all accounts managed by current account
    state.accounts.accounts = await fetchAccountData();
    // Make data on current account available (api response does not provide this data)
    const currentAccount = profile.value;
    state.accounts.accounts.unshift(currentAccount as IVeoAccount);

    const fileName = `${state.username}_accounts`;
    await downloadZIP(state.accounts.accounts, fileName);

    state.accounts.isLoading = false;
    displaySuccessMessage(t('successHeader'));
  } catch (error) {
    handleError(error);
    state.accounts.isLoading = false;
  }
}


// HISTORY Entrypoint
async function prepareHistoryData() {
  state.history.isLoading = true;
  await loadHistoryData();
  await createDownloadLinks();
}

watch(state.history.zipArchives, () =>  {
  if(state.history.zipArchives.length === 1) {
    state.history.isLoading = false;
    state.history.prepareData = false;
  }
});


async function loadHistoryData() {
  const maxItems = 10000;
  try {
    const lastItemID = state.history.items[state.history.items.length - 1]?.id;
    const history = await fetchHistoryData({size: maxItems, afterId: lastItemID});
    // const history = await devFetchHistoryData({size: maxItems, afterId: lastItemID});

    state.history.items.push(...history.items);

    if (history.items.length < maxItems) return;
    loadHistoryData();
  }
  catch (error) {
    handleError(error);
  }
}

// DEVELOPMENT
const devFetchHistoryData = ({size = 10000, afterId = null} = {}) => {
  const devUrl='http://localhost:3001/testData';
  return fetch(devUrl)
    .then((response) => response.json())
    .then((data) => {return {items: [...data]};});
};

function fetchHistoryData({size = 10000, afterId = null} = {} ) {
  const queryParams = afterId ? `?size=${size}&afterId=${afterId}` : `?size=${size}`;
  const url = `/api/history/revisions/paged${queryParams}`;
  return request(url, {});
}

function transformDateString(ISODateString: string) {
  return ISODateString.split('T')[0];
}


async function createDownloadLinks() {
  const archiveSize = 5000;
  const archives = chunk(state.history.items, archiveSize);

  archives.forEach(async (archive, index) => {

    // Compose file names of the following formats:
    // => history_2023-02-13_2023-02-05.zip
    // => history_2023-02-13_2023-02-05_1.zip
    const startDate = transformDateString(archives[index][0].content.createdAt);
    const endDate = transformDateString(archives[index][archives[index].length -1].content.createdAt);
    const fileName = `history_${startDate}_${endDate}`;
    if (fileName === state.history.archiveName.name) {
      state.history.archiveName.counter ++;
    }
    else {
      state.history.archiveName.counter = 0;
      state.history.archiveName.name = '';
    }

    // Create unique names for archives having the same name
    const counter = state.history.archiveName.counter;
    const countedFileName = counter === 0 ? fileName : fileName + '_' + counter;
    state.history.archiveName.name = countedFileName;

    // Create zip archive of a give chunk
    const zip = await createZIP(archive, countedFileName);
    state.history.zipArchives.push({name: countedFileName, zip});
  });

}


async function exportHistoryData(index) {
  try {
    download(state.history.zipArchives[index].zip, state.history.zipArchives[index].name);
    displaySuccessMessage(t('successHeader'));
  } catch (error) {
    handleError(error);
  }
}

function handleError(err: unknown) {
  let message;
  if(err instanceof Error) message = err.message;
  else message = String(err);
  console.warn("Data export went wrong!", message);
  displayErrorMessage( t('errorHeader'), t('errorBody'));
}

onMounted(()=> {
  // prepareHistoryData();
});
</script>

<i18n>
{
"en": {
"hint": "This page allows you to export data associated with your account.",
"unitHeader": "Units",
"unitBody": "Download unit data here. The following units are available:",
"domainHeader": "Domains",
"domainBody": "Download domain data here. The folowing domains are available:",
"historyHeader": "History",
"historyBody": "Download history data here.",
"accountHeader": "Accounts",
"accountBody": "Download account data here.",
"buttonDownload": "Download",
"buttonPrepareDownload": "Prepare Download",
"alertHeader": "Sorry, no data available.",
"alertBody": "Please contact our support team: verinice{'@'}sernet.de.",
"errorHeader": "Could not download your data.",
"errorBody": "Please contact our support team: verinice{'@'}sernet.de.",
"successHeader": "Download Successfull.",
},

"de": {
"hint": "Hier können Sie Ihr Recht auf Datenübertragbarkeit nach { 0 } wahrnehmen. Laden Sie ihre personenbezogenen Daten im JSON-Format (ZIP-komprimiert) durch Mausklick auf die Downloadlinks herunter:",
"linkText": "Artikel 20 DSGVO",

"unitHeader": "Folgende Units stehen zum Download bereit:",
"unitBody": "",
"domainHeader": "Daten zur Domäne DS-GVO (vereinfacht die spätere Wiederverwendung in verinice.veo DSMS):",
"domainBody": "",
"historyHeader": "Daten-History:",
"historyBody": "",
"accountHeader": "Benutzerdaten:",
"accountBody": "",
"buttonDownload": "Download",
"buttonPrepareDownload": "Download vorbereiten",
"alertHeader": "Leider sind keine Daten vorhanden",
"alertBody": "Bitte kontaktieren Sie unseren Support: verinice{'@'}sernet.de.",
"errorHeader": "Download fehlgeschlagen.",
"errorBody": "Bitte kontaktieren Sie unseren Support: verinice{'@'}sernet.de.",
"successHeader": "Download erfolgreich.",
}
}
</i18n>
