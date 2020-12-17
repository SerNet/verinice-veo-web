<template>
  <VeoPage :title="$t('page.settings.title')">
    <v-row class="flex-column">
      <v-col class="settings-item">
        <span class="settings-item-description">
          {{ $t('page.settings.language') }}:
        </span>
        <v-select
          :value="$i18n.locale"
          :items="langs"
          class="language-btn"
          color="primary"
          label="Languages"
          flat
          dense
          solo
          outlined
          hide-details
          background-color="transparent"
          @input="$i18n.setLocale($event)"
        />
      </v-col>
      <v-divider class="mt-8 mb-3 mx-3" />
      <v-col class="settings-item py-1">
        <span class="settings-item-description">
          {{ $t('page.settings.version') }}:
        </span>
        <span style="font-size: 1.2rem;">{{ $config.version }}</span>
      </v-col>
      <v-col class="settings-item py-1">
        <span class="settings-item-description">
          {{ $t('page.settings.build') }}:
        </span>
        <span style="font-size: 1.2rem;">{{ $config.build }}</span>
      </v-col>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'

export default Vue.extend({
  components: {
    VeoPage
  },
  data() {
    return {
      langs: [
        { value: 'en', text: 'English' },
        { value: 'de', text: 'Deutsch' }
      ]
    }
  },
  async fetch() {},
  head(): any {
    return {
      title: this.$t('page.settings.title')
    }
  }
})
</script>

<style lang="scss" scoped>
.language-btn {
  max-width: 200px;
}

.settings-item {
  align-items: center;
  display: flex;

  .settings-item-description {
    font-size: 1.2rem;
    margin-right: 8px;
  }
}
</style>
