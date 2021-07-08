<template>
  <v-data-table
    :items="displayedItems"
    item-key="id"
    :headers="headers"
    class="veo-report-list"
    :items-per-page="itemsPerPage"
    :loading="loading"
    @click:row="$emit('create-report', $event.id)"
  >
    <template #no-data>
      <span class="text-center">
        {{ $t('noReports') }}
      </span>
    </template>
    <template #item.name="{ value }">
      <b>{{ value }}</b>
    </template>
    <template #item.description="{ item, value }">
      <div class="veo-report-list__description">
        <v-tooltip
          v-if="item.descriptionShort"
          bottom
        >
          <template #activator="{ on }">
            <span
              class="veo-report-list__description--description"
              v-on="on"
            >{{ item.descriptionShort }}</span>
          </template>
          <template #default>
            <span>{{ value }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ value }}</span>
      </div>
    </template>
    <template #item.outputTypes="{ value }">
      {{ toUpper(value) }}
    </template>
  </v-data-table>
</template>
<script lang="ts">
import { upperFirst, toUpper } from 'lodash';
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { IVeoReportMeta, IVeoReportsMeta } from '~/types/VeoTypes';

interface IReport {
  id: string;
  name: string;
  description: string;
  multipleTargetsSupported: boolean;
  outputTypes: string;
  targetTypes: string;
}

interface IData {
  itemsPerPage: number;
  toUpper: CallableFunction;
}

export default Vue.extend({
  props: {
    items: {
      type: Object as Prop<IVeoReportsMeta[]>,
      default: () => {
        return {};
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data(): IData {
    return {
      itemsPerPage: 10,
      toUpper
    };
  },
  computed: {
    displayedItems(): IReport[] {
      return Object.entries(this.items).map(([id, item]) => {
        const _item = item as IVeoReportMeta;
        const name = _item.name[this.$i18n.locale] || _item.name[0];
        let description = _item.description[this.$i18n.locale] || _item.description[0];
        const targetTypes = _item.targetTypes.map((type) => upperFirst(type)).join(', ');
        const outputTypes = _item.outputTypes
          .map((type) => {
            const formatParts = type.split('/');
            return formatParts[formatParts.length - 1];
          })
          .join(', ');
        let descriptionShort;

        // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
        if (description.length > 80) {
          descriptionShort = description.substring(0, 80) + '...';

          if (description.length > 1000) {
            description = description.substring(0, 1000) + '...';
          }
        }
        return {
          id,
          name,
          description,
          multipleTargetsSupported: _item.multipleTargetsSupported,
          outputTypes,
          targetTypes,
          descriptionShort
        };
      });
    },
    headers(): any[] {
      return [
        {
          text: this.$t('reportName'),
          value: 'name'
        },
        {
          text: this.$t('targetTypes'),
          filterable: false,
          sortable: false,
          value: 'targetTypes'
        },
        {
          text: this.$t('reportDescription'),
          value: 'description'
        },
        {
          text: this.$t('outputTypes'),
          value: 'outputTypes'
        }
      ];
    }
  }
});
</script>

<i18n>
{
  "en": {
    "noReports": "There are no reports",
    "outputTypes": "Output format",
    "reportDescription": "Description",
    "reportName": "Report type",
    "targetTypes": "Available for"
  },
  "de": {
    "noReports": "Es existieren keine Reports",
    "outputTypes": "Ausgabeformat",
    "reportDescription": "Beschreibung",
    "reportName": "Reporttyp",
    "targetTypes": "Gültig für"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-report-list {
  cursor: pointer;
}

.veo-report-list__description {
  overflow: hidden;
  white-space: nowrap;
}

.veo-report-list__description--description {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>