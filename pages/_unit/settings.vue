<template>
  <v-col cols="12">
    <h1>{{ $t('page.settings.title') }}</h1>
    <v-row class="mx-1 flex-column">
      <v-col class="settings-item">
        <span class="settings-item-description">{{ $t('page.settings.language') }}:</span>
        <v-overflow-btn
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
      <v-divider class="my-8" />
      <v-col class="settings-item py-1">
        <span class="settings-item-description">{{ $t('page.settings.version') }}:</span>
        <span style="font-size: 1.2rem;">{{ $config.version }}</span>
      </v-col>
      <v-col class="settings-item py-1">
        <span class="settings-item-description">{{ $t('page.settings.build') }}:</span>
        <span style="font-size: 1.2rem;">{{ $config.build }}</span>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
  },
  data() {
    return {
      langs: [
        { value: 'en', text: 'English' },
        { value: 'de', text: 'Deutsch' }
      ]
    }
  },
  methods: {},
  head(): any {
    return {
      title: this.$t('page.settings.title')
    }
  }
})
</script>

<style lang="scss" scoped>
.language-btn {
  max-width: 120px;
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
