<template>
  <VeoPage
    :title="title"
    padding
  >
    <p
      class="veo-unit-description"
      style="margin-top: -20px;"
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

import { separateUUIDParam } from '~/lib/utils';
import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoDomain } from '~/types/VeoTypes';

export default Vue.extend({
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
    } catch (e) {
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
