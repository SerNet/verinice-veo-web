<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
    :title="$t('breadcrumbs.reports')"
    fullsize
  >
    <template #header>
      <p class="mt-4">
        {{ $t('hint') }}
      </p>
    </template>
    <template #default>
      <VeoReportList
        :items="reports"
        @create-report="createReport"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { IVeoReportsMeta } from '~/types/VeoTypes';

interface IData {
  reports: IVeoReportsMeta;
}

export default Vue.extend({
  data(): IData {
    return {
      reports: {}
    };
  },
  async fetch() {
    this.reports = await this.$api.report.fetchAll();
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.reports')
    };
  },
  methods: {
    createReport(reportId: string) {
      this.$router.push(`/${this.$route.params.unit}/domains/${this.$route.params.domain}/reports/${reportId}`);
    }
  }
});
</script>

<i18n>
{
  "en": {
    "hint": "Choose the report type, for which you want to generate a report."
  },
  "de": {
    "hint": "Wählen Sie aus der Liste den Reporttyp aus, für den Sie einen Report erstellen möchten."
  }
}
</i18n>
