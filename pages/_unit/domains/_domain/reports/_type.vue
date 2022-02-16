<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Jessica Lühnen, Jochen Kemnade, Annemarie Bufe
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
    :title="title"
    :loading="$fetchState.pending"
    fullsize
  >
    <template #header>
      <v-row
        dense
        class="justify-space-between"
      >
        <v-col cols="auto">
          <p
            v-if="report"
            class="mt-2 mb-0"
          >
            {{ report.description[$i18n.locale] }}
          </p>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoLoadingWrapper v-if="generatingReport" />
      <p v-if="report && report.multipleTargetsSupported">
        {{ $t('hintMultiple') }}
      </p>
      <p v-else-if="report">
        {{ $t('hintSingle') }}
      </p>
      <v-row
        dense
        class="justify-space-between"
      >
        <v-col
          v-if="objectTypes.length > 1 || subTypes.length > 1"
          cols="12"
        >
          <b>{{ $t('filterObjects') }}</b>
        </v-col>
        <v-col
          v-if="objectTypes.length > 1"
          lg="3"
          md="6"
          cols="12"
        >
          <v-select
            v-model="objectType"
            :label="$t('objectType')"
            :items="objectTypes"
            class="mt-2"
            outlined
            dense
          />
        </v-col>
        <v-col
          v-if="subTypes.length > 1"
          lg="3"
          md="6"
          cols="12"
        >
          <v-select
            v-model="userSelectedSubType"
            :label="$t('form')"
            :items="subTypes"
            class="mt-2"
            outlined
            dense
            @change="onSubTypeChange"
          />
        </v-col>
        <v-spacer v-if="objectTypes.length <= 1 && subTypes.length <= 1" />
        <v-col cols="auto">
          <v-btn
            outlined
            class="my-4"
            color="primary"
            :disabled="global_loading || !selectedEntities.length"
            @click="generateReport"
          >
            {{ $t('generateReport') }}
          </v-btn>
          <a
            ref="downloadButton"
            href="#"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col
          cols="auto"
          class="d-flex align-center"
        >
          <v-btn
            v-cy-name="'filter-button'"
            class="mr-2"
            rounded
            primary
            depressed
            small
            style="border: 1px solid black"
            @click="filterDialogVisible = true"
          >
            <v-icon>{{ mdiFilter }}</v-icon> {{ upperFirst($t('filter').toString()) }}
          </v-btn>
        </v-col>
        <v-col
          cols="auto"
          class="grow"
        >
          <v-chip-group v-cy-name="'chips'">
            <VeoObjectChip
              v-for="k in activeFilterKeys"
              :key="k"
              :label="formatLabel(k)"
              :value="formatValue(k, filter[k])"
              :close="k!='objectType'"
              @click:close="clearFilter(k)"
            />
          </v-chip-group>
        </v-col>
      </v-row>
      <VeoEntitySelectionList
        v-model="selectedEntities"
        :items="entities"
        :loading="$fetchState.pending || global_loading"
        single-select
        @page-change="onPageChange"
      />
      <VeoFilterDialog
        v-model="filterDialogVisible"
        :domain="domainId"
        :filter="filter"
        object-type-required
        @update:filter="updateRouteQuery"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { upperCase, upperFirst } from 'lodash';
import Vue from 'vue';
import { mdiFilter } from '@mdi/js';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { IVeoCreateReportData, IVeoEntity, IVeoFormSchemaMeta, IVeoPaginatedResponse, IVeoReportMeta, IVeoReportsMeta } from '~/types/VeoTypes';

export const ROUTE_NAME = 'unit-domains-domain-reports-type';

export default Vue.extend({
  name: 'VeoReportPage',
  data() {
    return {
      entities: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      selectedEntities: [] as { id: string; type: string }[],
      report: undefined as IVeoReportMeta | undefined,
      generatingReport: false as boolean,
      loading: false as boolean,
      objectType: undefined as undefined | string,
      userSelectedSubType: undefined as undefined | string,
      forms: [] as IVeoFormSchemaMeta[],
      filterDialogVisible: false,
      filterKeys: ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects', 'hasLinks'],
      formschemas: [] as IVeoFormSchemaMeta[],
      mdiFilter,
      upperFirst
    };
  },
  async fetch() {
    this.forms = await this.$api.form.fetchAll();
    const reports: IVeoReportsMeta = await this.$api.report.fetchAll();
    this.report = reports[this.reportId];

    // Preselect the object type (and trigger the api request)
    this.objectType = this.report.targetTypes[0].modelType;

    this.formschemas = await this.$api.form.fetchAll(this.domainId);

    this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
  },
  head(): any {
    return {
      title: this.title
    };
  },
  computed: {
    outputFormat(): string {
      return this.report?.outputTypes[0].split('/').pop() || '';
    },
    title(): string {
      return this.$t('create', { type: this.report?.name[this.$i18n.locale] || '', format: upperCase(this.outputFormat || '') });
    },
    reportId(): string {
      return this.$route.params.type;
    },
    global_loading(): boolean {
      return this.$fetchState.pending || this.generatingReport;
    },
    objectTypes(): { value: string; text: string }[] {
      return (
        this.report?.targetTypes.map((targetType) => ({
          text: upperFirst(targetType.modelType),
          value: targetType.modelType
        })) || []
      );
    },
    currentTargetType(): { modelType: string; subTypes?: null | string[] } | undefined {
      return this.report?.targetTypes.find((targetType) => targetType.modelType === this.objectType);
    },
    subType(): string | undefined {
      if (!this.currentTargetType?.subTypes) {
        return undefined;
      } else if (this.currentTargetType.subTypes.length === 0) {
        return '';
      } else {
        return this.userSelectedSubType;
      }
    },
    subTypes(): { value: string; text: string }[] {
      return (this.currentTargetType?.subTypes || []).map((entry) => ({
        text: this.forms.find((form) => form.subType === entry)?.name[this.$i18n.locale] || '',
        value: entry
      }));
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    activeFilterKeys(): string[] {
      return this.filterKeys.filter((k) => this.filter[k] !== undefined);
    },
    // filter built from URL query parameters
    filter(): IBaseObject {
      const query = this.$route.query;
      return Object.fromEntries(
        this.filterKeys.map((key) => {
          // Extract first query value
          const val = ([] as (string | null)[]).concat(query[key]).shift();
          return [key, val === null ? true : val];
        })
      );
    }
  },
  watch: {
    objectType() {
      // Preselect the first subtype fitting the previous selected object type
      this.userSelectedSubType = this.currentTargetType?.subTypes?.[0];

      this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    }
  },
  methods: {
    async generateReport() {
      this.generatingReport = true;
      if (this.report) {
        const outputType = this.report.outputTypes[0];
        const body: IVeoCreateReportData = {
          outputType,
          targets: this.selectedEntities
        };
        const result = new Blob([await this.$api.report.create(this.reportId, body)], { type: outputType });

        const downloadButton = this.$refs.downloadButton;
        downloadButton.href = URL.createObjectURL(result);
        downloadButton.download = `${this.report.name[this.$i18n.locale]}.${outputType.split('/').pop() || outputType}`;
        downloadButton.click();
      }
      this.generatingReport = false;
    },
    onSubTypeChange() {
      this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    },
    onNewSubEntities(items: { type: string; id: string }[]) {
      this.selectedEntities = items;
    },
    async fetchEntities(options: { page: number; sortBy: string; sortDesc: boolean }) {
      this.loading = true;

      if (this.objectType) {
        this.entities = await this.$api.entity.fetchAll(this.objectType, options.page, {
          ...(this.subType || this.subType === '' ? { subType: this.subType } : {}),
          size: this.$user.tablePageSize,
          sortBy: options.sortBy,
          sortOrder: options.sortDesc ? 'desc' : 'asc',
          ...(this.filter || {})
        });
      }

      this.loading = false;
    },
    formatLabel(label: string) {
      return upperFirst(this.$t(`objectlist.${label}`).toString());
    },
    formatValue(label: string, value?: string) {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return upperFirst(value);
        // Translate sub types
        case 'subType':
          return this.formschemas.find((formschema) => formschema.subType === value)?.name?.[this.$i18n.locale] || value;
        default:
          return value;
      }
    },
    clearFilter(key: string) {
      this.updateRouteQuery({ [key]: undefined }, false);
    },
    // refetch on page or sort changes (in VeoObjectTable)
    async onPageChange(opts: { newPage: number; sortBy: string; sortDesc?: boolean }) {
      await this.fetchEntities({ page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    },
    // Update query parameters but keep other route options
    async updateRouteQuery(v: Record<string, string | undefined | null | true>, reset = true) {
      const resetValues = reset ? this.filterKeys.map((key) => [key, undefined as string | undefined | null]) : [];
      const newValues = Object.fromEntries(resetValues.concat(Object.entries(v).map(([k, v]) => [k, v === true ? null : v])));
      const query = { ...this.$route.query, ...newValues };
      // obsolete params need to be removed from the query to match the route exactly in the NavigationDrawer
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
      await this.$router.push({ ...this.$route, name: this.$route.name!, query });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "create": "Create {type} ({format})",
    "filter": "filter",
    "filterObjects": "Filter objects",
    "form": "Sub type",
    "generateReport": "Generate report",
    "hintMultiple": "Please select the object you want to create the report for.",
    "hintSingle": "Please select the object you want to create the report for.",
    "objectType": "Object type"
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "filter": "filter",
    "filterObjects": "Objektauswahl weiter einschränken",
    "form": "Subtyp",
    "generateReport": "Report generieren",
    "hintMultiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hintSingle": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten.",
    "objectType": "Objekttyp"
  }
}
</i18n>
