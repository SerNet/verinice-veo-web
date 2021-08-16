<template>
  <VeoPage
    :title="title"
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
        </v-col>
      </v-row>
      <VeoListSearchBar
        v-model="filter"
        :object-type="objectType"
      />
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

import { IVeoCreateReportData, IVeoEntity, IVeoFormSchemaMeta, IVeoPaginatedResponse, IVeoReportMeta, IVeoReportsMeta } from '~/types/VeoTypes';
import { IVeoFilter } from '~/components/layout/VeoListSearchBar.vue';

export default Vue.extend({
  data() {
    return {
      filter: undefined as IVeoFilter | undefined,
      entities: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      selectedEntities: [] as { id: string; type: string }[],
      report: undefined as IVeoReportMeta | undefined,
      generatingReport: false as boolean,
      loading: false as boolean,
      objectType: undefined as undefined | string,
      userSelectedSubType: undefined as undefined | string,
      forms: [] as IVeoFormSchemaMeta[]
    };
  },
  async fetch() {
    this.forms = await this.$api.form.fetchAll();
    const reports: IVeoReportsMeta = await this.$api.report.fetchAll();
    this.report = reports[this.reportId];

    // Für Review, danach entfernen
    this.report.targetTypes = [
      {
        modelType: 'scope'
        // subTypes: null
        // subTypes: ['SCP_Processor']
        // subTypes: ['SCP_Processor', 'SCP_ResponsibleBody']
        // subTypes: []
      }
    ];

    // Preselect the object type (and trigger the api request)
    this.objectType = this.report.targetTypes[0].modelType;
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
    }
  },
  watch: {
    filter(newValue: IVeoFilter) {
      this.$router.push({
        ...this.$route,
        query: {
          filter: newValue?.property,
          value: newValue?.value
        }
      });
      this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    },
    objectType() {
      // Preselect the first subtype fitting the previous selected object type
      this.userSelectedSubType = this.currentTargetType?.subTypes?.[0];

      this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    }
  },
  mounted() {
    if (this.$route.query.filter && this.$route.query.value) {
      this.filter = {
        property: this.$route.query.filter,
        value: this.$route.query.value
      };
    }
  },
  methods: {
    async generateReport() {
      this.generatingReport = true;
      if (this.report) {
        const body: IVeoCreateReportData = {
          outputType: this.report.outputTypes[0],
          targets: this.selectedEntities
        };
        const result = new Blob([await this.$api.report.create(this.reportId, body)], { type: 'application/pdf' });
        window.open(URL.createObjectURL(result));
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

      this.entities = await this.$api.entity.fetchAll(this.objectType, options.page, {
        ...(this.subType || this.subType === '' ? { subType: this.subType } : {}),
        size: this.$user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc',
        ...(this.filter ? { [this.filter.property]: this.filter.value } : {})
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
    "filterObjects": "Filter objects",
    "form": "Sub type",
    "generateReport": "Generate report",
    "hintMultiple": "Please select the object you want to create the report for.",
    "hintSingle": "Please select the object you want to create the report for.",
    "objectType": "Object type"
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "filterObjects": "Objektauswahl weiter einschränken",
    "form": "Subtyp",
    "generateReport": "Report generieren",
    "hintMultiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hintSingle": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten.",
    "objectType": "Objekttyp"
  }
}
</i18n>
