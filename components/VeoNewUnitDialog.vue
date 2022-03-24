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
  <VeoDialog
    v-model="dialog"
    :headline="$t('unit.create')"
    :persistent="persistent"
    :close-disabled="loading"
  >
    <template #default>
      <VeoLoadingWrapper v-if="loading" />
      <v-alert
        v-if="error.value"
        type="error"
      >
        {{ error.content }}
      </v-alert>
      <v-form
        v-model="valid"
        class="new-unit-form"
      >
        <v-text-field
          v-model="newUnit.name"
          :rules="rules.name"
          required
          :label="$t('unit.details.name')"
        />
        <v-text-field
          v-model="newUnit.description"
          :rules="rules.description"
          required
          :label="$t('unit.details.description')"
        />
        <!-- VEO-78: Unit Hierarchien deaktiviert, da im Backend nicht implementiert
        <v-select
          class="unit-select flex-grow-0"
          multiple
          :items="units"
          item-text="name"
          item-value="id"
          :value="newUnit.units"
          :label="$t('unit.details.children')"
        />
        -->
      </v-form>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        :disabled="!valid"
        color="primary"
        text
        @click="createUnit()"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue';

import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import { VeoEvents } from '~/types/VeoGlobalEvents';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false as boolean,
      noWatch: false as boolean,
      units: [] as Array<any>,
      newUnit: {} as { units: string[]; name: string; description: string },
      valid: false as boolean,
      rules: {
        name: [(v: string) => !!v || this.$t('unit.details.name.required')],
        description: [(v: string) => !!v || this.$t('unit.details.description.required')]
      },
      error: {
        value: false as boolean,
        content: '' as string
      },
      loading: false as boolean
    };
  },
  async fetch() {
    /* if (this.$user.auth.profile) {
      this.units = await this.$api.unit.fetchAll()
    } */
  },
  watch: {
    value(newValue) {
      this.noWatch = true;
      this.dialog = newValue;
      this.noWatch = false;
    },
    dialog(newValue) {
      if (!this.noWatch) {
        if (newValue) {
          this.dialog = newValue;
        } else {
          this.$emit('input', false);
        }
      }
    }
  },
  mounted() {
    this.noWatch = true;
    this.dialog = this.value;
    this.noWatch = false;
  },
  methods: {
    createUnit() {
      this.loading = true;
      this.$api.unit
        .create(this.newUnit)
        .then(async (data: any) => {
          const unit = await this.$api.unit.fetch(data.resourceId);
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.created') });
          this.error.value = false;
          this.dialog = false;
          this.$root.$emit(VeoEvents.UNIT_CREATED);
          const domainId = getFirstDomainDomaindId(unit);

          if (domainId) {
            this.$router.push({
              name: 'unit-domains-domain',
              params: {
                unit: createUUIDUrlParam('unit', unit.id),
                domain: createUUIDUrlParam('domain', domainId)
              }
            });
          }
        })
        .catch((error: string) => {
          this.error.value = true;
          this.error.content = error;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
});
</script>
<style lang="scss" scoped>
.new-unit-form {
  max-width: 400px;
  width: 100%;
}
</style>
