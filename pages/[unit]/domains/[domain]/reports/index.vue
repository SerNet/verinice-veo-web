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
  <BasePage :title="t('breadcrumbs.reports')">
    <template #header>
      <p class="mt-4 text-body-1">
        {{ t('hint') }}
      </p>
    </template>
    <template #default>
      <BaseCard>
        <VeoReportList
          :items="reports"
          :loading="isFetching"
          @create-report="createReport"
        />
      </BaseCard>
    </template>
  </BasePage>
</template>

<script lang="ts">
import { useFetchReports } from '~/composables/api/reports';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const { data: reports, isFetching } = useFetchReports();

    const createReport = (reportId: string) => {
      router.push(`/${route.params.unit}/domains/${route.params.domain}/reports/${reportId}`);
    };

    return {
      createReport,
      isFetching,
      reports,

      t
    };
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
