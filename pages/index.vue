<template>
  <VeoPage :title="$t('breadcrumbs.index')">
    <div class="body-1 mb-4">
      {{ $t('unitpicker') }}:
    </div>
    <v-data-iterator
      :search="search"
      :items="units"
      item-key="id"
    >
      <template #header>
        <v-text-field
          v-model="search"
          dense
          clearable
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          :label="$t('unitpickerPlaceholder')"
        />
      </template>
      <template #default="{ items }">
        <v-list dense>
          <v-list-item
            v-for="item in items"
            :key="item.id"
            two-line
            :to="'/' + createUUIDUrlParam('unit', item.id)"
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.name" />
              <v-list-item-subtitle v-text="item.description" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-data-iterator>
    <VeoWelcomeDialog
      v-if="showWelcomeDialog"
      v-model="showWelcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoUnit } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';

export default Vue.extend({
  props: {},
  data() {
    return {
      search: '',
      unit: '',
      units: [] as IVeoUnit[],
      showWelcomeDialog: false as boolean
    };
  },
  async fetch() {
    const units = await this.$api.unit.fetchAll();

    // Only applicable if the user has only two units (one demo and one main)
    if (this.$user.auth.profile?.attributes.maxUnits[0] === '2') {
      const nonDemoUnit = units.find((unit) => unit.name !== 'Demo');

      // Auto-redirect the user to his non demo unit upon visting the app. If it doesn't exist create it and then redirect
      if (nonDemoUnit) {
        this.$router.push(createUUIDUrlParam('unit', nonDemoUnit.id));
      } else {
        const result = await this.$api.unit.create({
          name: 'Unit 1',
          description: this.$t('firstUnitDescription')
        });
        this.$router.push(createUUIDUrlParam('unit', result.resourceId));
      }
    }

    this.units = units;
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.index')
    };
  },
  mounted() {
    this.showWelcomeDialog = !LocalStorage.firstStepsCompleted;
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<i18n>
{
  "en": {
    "firstUnitDescription": "This is your first unit",
    "unitPicker": "Please choose a unit",
    "unitpickerPlaceholder": "Search for a unit..."
  },
  "de": {
    "firstUnitDescription": "Dies ist ihre erste Unit",
    "unitpicker": "Bitte wählen Sie eine Unit",
    "unitpickerPlaceholder": "Nach einer Unit suchen..."
  }
}
</i18n>
