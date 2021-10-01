<!--
   - verinice.veo web
   - Copyright (C) 2021  Philipp Ballhausen, Davit Svandize, Jonas Heitmann, Tino Groteloh
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
    padding
  >
    <p
      class="veo-unit-description"
    >
      <span v-if="unit.description">{{ unit.description }}</span>
      <i v-else>{{ $t('unit.details.nodescription') }}</i>
    </p>
    <v-row
      no-gutters
      class="flex-column fill-height"
    >
      <div
        v-if="$fetchState.pending"
        class="flex-grow-1 d-flex align-center justify-center"
      >
        <v-progress-circular
          size="64"
          color="primary"
          indeterminate
        />
      </div>
      <template v-else>
        <v-row>
          <!--<v-col
            :cols="12"
            sm="6"
            lg="4"
          >
            <VeoUnitWidget :unit="unit" />
          </v-col>-->
          <v-col
            :cols="12"
            md="6"
          >
            <VeoUnitFormsWidget
              v-for="domain of domains"
              :key="domain.id"
              :domain="domain"
              :unit="unit"
            />
          </v-col>
          <v-col
            :cols="12"
            md="6"
          >
            <VeoUnitObjectWidget :unit="unit" />
          </v-col>
        </v-row>
      </template>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoDomain } from '~/types/VeoTypes';

export default Vue.extend({
  // VEO-692
  middleware({ $user, redirect, params, $api }) {
    if ($user.lastDomain) {
      redirect(`/${params.unit}/domains/${createUUIDUrlParam('domain', $user.lastDomain)}`);
    } else {
      $api.domain.fetchAll().then((domains) => {
        redirect(`/${params.unit}/domains/${createUUIDUrlParam('domain', domains[0].id)}`);
      });
    }
  },
  data() {
    return {
      unit: {} as any,
      domains: [] as IVeoDomain[]
    };
  },
  async fetch() {
    try {
      this.unit = await this.$api.unit.fetch(this.unitId);
      this.domains = await this.$api.domain.fetchUnitDomains(this.unitId);
    } catch (e: any) {
      if (e.code === 404) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          type: ALERT_TYPE.ERROR,
          title: this.$t('error404'),
          text: this.$t('unitNotFoundText')
        } as IVeoEventPayload);
        this.$router.push('/');
      }
    }
  },
  head(): any {
    return {
      title: this.$t('unit.index.title')
    };
  },
  computed: {
    title(): string {
      return this.unit.name;
    },
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id;
    }
  },
  watch: {
    '$route.params': '$fetch'
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-unit-description {
  color: $accent;
  margin-top: -20px;
}
</style>

<i18n>
{
  "en": {
    "unitNotFoundText": "The requested unit couldn't be found. You have been returned to the unit selection."
  },
  "de": {
    "unitNotFoundText": "Die gewünschte Unit konnte nicht gefunden werden. Sie wurden zur Unitauswahl zurückgebracht."
  }
}
</i18n>
