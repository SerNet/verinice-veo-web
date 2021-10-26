<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Jessica Lühnen
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
    padding
  >
    <p
      v-if="domain"
      class="veo-unit-description"
    >
      <span v-if="domain.description">{{ domain.description }}</span>
      <i v-else>{{ $t('unit.details.nodescription') }}</i>
    </p>
    <v-row
      v-if="domain"
      no-gutters
      class="flex-column fill-height"
    >
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <VeoUnitFormsWidget
            :domain="domain"
            :unit="unit"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <VeoDataProcessingWidget />
          <VeoMyLatestRevisionsWidget class="mt-8" />
        </v-col>
      </v-row>
    </v-row>
    <VeoWelcomeDialog
      v-if="showWelcomeDialog"
      v-model="showWelcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';

export default Vue.extend({
  data() {
    return {
      domain: undefined as IVeoDomain | undefined,
      unit: {} as any,
      showWelcomeDialog: false as boolean
    };
  },
  async fetch() {
    try {
      this.unit = await this.$api.unit.fetch(this.unitId);
      this.domain = await this.$api.domain.fetch(this.domainId);
    } catch (e: any) {
      if (e.code === 404) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          type: ALERT_TYPE.ERROR,
          title: this.$t('error404'),
          text: this.$t('domainNotFoundText')
        } as IVeoEventPayload);
        this.$router.push(`/${this.$route.params.unit}`);
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
      return this.domain?.name || this.$t('domainOverview').toString();
    },
    domainId() {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id;
    }
  },
  watch: {
    '$route.params': '$fetch'
  },
  mounted() {
    this.showWelcomeDialog = !LocalStorage.firstStepsCompleted;
  }
});
</script>

<i18n>
{
  "en": {
    "domainOverview": "Module overview"
  },
  "de": {
    "domainOverview": "Modulübersicht"
  }
}
</i18n>

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
    "domainNotFoundText": "The requested domain couldn't be found. You have been returned to the unit dashboard."
  },
  "de": {
    "domainNotFoundText": "Die gewünschte Domain konnte nicht gefunden werden. Sie wurden zum Unit Dashboard zurückgebracht."
  }
}
</i18n>