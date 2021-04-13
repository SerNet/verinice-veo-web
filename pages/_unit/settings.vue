<template>
  <VeoPage :title="$t('breadcrumbs.settings')">
    <v-row class="flex-column">
      <v-col class="settings-item">
        <span class="settings-item-description">
          {{ $t('language') }}:
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
          {{ $t('version') }}:
        </span>
        <span style="font-size: 1.2rem;">{{ $config.version }}</span>
      </v-col>
      <v-col class="settings-item py-1">
        <span class="settings-item-description">
          {{ $t('build') }}:
        </span>
        <span style="font-size: 1.2rem;">{{ $config.build }}</span>
      </v-col>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
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
      title: this.$t('breadcrumbs.settings')
    }
  }
})
</script>

<i18n>
{
  "en": {
    "build": "Build",
    "language": "Language",
    "version": "Version"
  },
  "de": {
    "build": "Build",
    "language": "Sprache",
    "version": "Version"
  }
}
</i18n>

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
