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
          :items="displayedUnits"
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
import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';

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
    },
    displayedUnits(): IVeoUnit[] {
      // Only display units with at least one domain
      return this.units.filter((unit) => unit.domains[0]);
    }
  },
  methods: {
    doChangeUnit(unitId: string) {
      const unit = this.units.find((unit) => unit.id === unitId) as IVeoUnit;
      const domainId = getFirstDomainDomaindId(unit) as string;
      this.$router.push({
        name: 'unit-domains-domain',
        params: {
          unit: createUUIDUrlParam('unit', unitId),
          domain: createUUIDUrlParam('domain', domainId)
        }
      });
    },
    doCreateUnit(persistent: boolean = false) {
      this.$root.$emit(VeoEvents.UNIT_CREATE, persistent);
    }
  }
});
</script>
