<template>
  <VeoPage
    :title="title"
    :loading="$fetchState.pending"
    padding
  >
    <v-row
      v-if="domain"
      no-gutters
      class="flex-column fill-height"
      style="margin-top: -20px;"
    >
      <p class="veo-unit-description">
        <span v-if="domain.description">{{ domain.description }}</span>
        <i v-else>{{ $t('unit.details.nodescription') }}</i>
      </p>
      <v-row>
        <v-col
          :cols="12"
          sm="6"
        >
          <VeoUnitFormsWidget
            :domain="domain"
            :unit="unit"
          />
        </v-col>
      </v-row>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      domain: undefined as IVeoDomain | undefined,
      unit: {} as any
    };
  },
  async fetch() {
    this.unit = await this.$api.unit.fetch(this.unitId);
    this.domain = await this.$api.domain.fetch(this.domainId);
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
  }
});
</script>

<i18n>
{
  "en": {
    "domainOverview": "Domain overview"
  },
  "de": {
    "domainOverview": "Domainübersicht"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-unit-description {
  color: $accent;
}
</style>
