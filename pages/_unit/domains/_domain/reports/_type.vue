<template>
  <VeoPage
    :title="title"
    fullsize
  >
    <template #header>
      <v-row class="justify-space-between">
        <v-col cols="auto">
          <p
            v-if="report"
            class="mt-4"
          >
            {{ report.description }}
          </p>
        </v-col>
        <v-col cols="auto">
          <v-btn
            outlined
            color="primary"
            class="mt-4"
            :disabled="global_loading || !selectedEntities.length"
            @click="generateReport"
          >
            {{ $t('generateReport') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoLoadingWrapper v-if="generatingReport" />
      <p v-if="report && report.multiselect">
        {{ $t('hintMultiple') }}
      </p>
      <p v-else-if="report">
        {{ $t('hintSingle') }}
      </p>
      <v-row v-if="objectTypes.length > 1">
        <v-col
          lg="3"
          md="6"
          cols="12"
        >
          <span>
            {{ $t('shown_objecttype') }}:
          </span>
          <v-select
            v-model="objectType"
            :label="$t('object_type')"
            :items="objectTypes"
            class="mt-2"
            outlined
            dense
          />
        </v-col>
      </v-row>   
      <VeoEntitySelectionList
        :selected-items="selectedEntities"
        :items="entities"
        :loading="$fetchState.pending || global_loading"
        single-select
        :object-type="objectType"
        @new-subentities="onNewSubEntities"
        @page-change="fetchEntities"
        @refetch="fetchEntities"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { upperCase, upperFirst } from 'lodash';
import Vue from 'vue';

import { IVeoCreateReportData, IVeoEntity, IVeoPaginatedResponse, IVeoReportsMeta } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      entities: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      selectedEntities: [] as { id: string; type: string }[],
      report: undefined as
        | undefined
        | {
            name: string;
            description: string;
            outputFormat: string;
            outputType: string;
            multiselect: boolean;
            targetTypes: string[];
          },
      generatingReport: false as boolean,
      loading: false as boolean,
      objectType: undefined as undefined | string
    };
  },
  async fetch() {
    const reports: IVeoReportsMeta = await this.$api.report.fetchAll();
    const _report = reports[this.reportId];
    const format = _report.outputTypes
      .map((type) => {
        const formatParts = type.split('/');
        return formatParts[formatParts.length - 1];
      })
      .join(', ');

    if (_report) {
      this.report = {
        name: _report.name[this.$i18n.locale],
        description: _report.description[this.$i18n.locale],
        outputFormat: format,
        outputType: _report.outputTypes[0],
        multiselect: _report.multipleTargetsSupported,
        targetTypes: _report.targetTypes
      };

      this.objectType = _report.targetTypes[0];
      this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    }
  },
  head(): any {
    return {
      title: this.title
    };
  },
  computed: {
    title(): string {
      return this.$t('create', { type: this.report?.name || '', format: upperCase(this.report?.outputFormat || '') });
    },
    reportId(): string {
      return this.$route.params.type;
    },
    global_loading(): boolean {
      return this.$fetchState.pending || this.generatingReport;
    },
    objectTypes(): { value: string; text: string }[] {
      return (
        this.report?.targetTypes.map((targetType: string) => ({
          text: upperFirst(targetType),
          value: targetType
        })) || []
      );
    }
  },
  watch: {
    objectType(_newValue: string, oldValue: string) {
      if (oldValue) {
        this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
      }
    }
  },
  methods: {
    async generateReport() {
      this.generatingReport = true;
      if (this.report) {
        const body: IVeoCreateReportData = {
          outputType: this.report.outputType,
          targets: this.selectedEntities
        };
        const result = new Blob([await this.$api.report.create(this.reportId, body)], { type: 'application/pdf' });
        window.open(URL.createObjectURL(result));
      }
      this.generatingReport = false;
    },
    onNewSubEntities(items: { type: string; id: string }[]) {
      this.selectedEntities = items;
    },
    async fetchEntities(options: { page: number; sortBy: string; sortDesc: boolean }) {
      this.loading = true;

      this.entities = await this.$api.entity.fetchAll(this.objectType, options.page, {
        size: this.$user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc'
      });

      this.loading = false;
    }
  }
});
</script>

<i18n>
{
  "en": {
    "create": "Create {type} ({format})",
    "generateReport": "Generate report",
    "hintMultiple": "Please select the object you want to create the report for.",
    "hintSingle": "Please select the object you want to create the report for.",
    "object_type": "Object type",
    "shown_objecttype": "Object type to link"
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "generateReport": "Report generieren",
    "hintMultiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hintSingle": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten.",
    "object_type": "Objekttyp",
    "shown_objecttype": "Zu verknüpfender Objekttyp"
  }
}
</i18n>
