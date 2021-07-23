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
    } catch (e) {
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