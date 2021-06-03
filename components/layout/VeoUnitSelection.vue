<template>
  <div style="display: contents">
    <v-list-item>
      <v-list-item-title class="d-flex justify-end">
        <v-btn
          color="primary"
          text
          @click="doCreateUnit()"
        >
          <v-icon>mdi-plus</v-icon> {{ $t('unit.create.short') }}
        </v-btn>
      </v-list-item-title>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <v-autocomplete
          :value="unit"
          :items="units"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          :label="$t('unit.select.label')"
          @change="doChangeUnit"
        />
      </v-list-item-content>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { IVeoUnit } from '~/types/VeoTypes';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { separateUUIDParam } from '~/lib/utils';

export default Vue.extend({
  props: {
    units: {
      type: Array as Prop<IVeoUnit[]>,
      required: true
    }
  },
  computed: {
    unit(): string | undefined {
      return (this.$route.params.unit && separateUUIDParam(this.$route.params.unit).id) || '-';
    }
  },
  methods: {
    doChangeUnit(unit: string) {
      this.$root.$emit(VeoEvents.UNIT_CHANGED, unit);
    },
    doCreateUnit(persistent: boolean = false) {
      this.$root.$emit(VeoEvents.UNIT_CREATE, persistent);
    }
  }
});
</script>
