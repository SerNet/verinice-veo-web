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
  <BasePage>
    <template #header>
      <BaseContainer class="pt-0 pb-1">
        <p>
          {{ t('hint') }}
        </p>
      </BaseContainer>
    </template>

    <template #default>
      <BaseContainer>
        <ReportList @create-report="createReport" />
      </BaseContainer>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-reports';
export default defineComponent({
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const createReport = async (report: any) => {
      await navigateTo(`/${route.params.unit}/domains/${route.params.domain}/reports/${report.originalId}`);
    };

    return {
      createReport,

      t
    };
  }
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-reports-index.json"></i18n>
