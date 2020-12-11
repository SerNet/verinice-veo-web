<template>
  <VeoPage :title="title" padding>
    <v-row no-gutters class="flex-column" style="margin-top: -20px;">
      <p class="veo-unit-description">
        <span v-if="unit.description">{{ unit.description }}</span>
        <i v-else>{{ $t('unit.details.nodescription') }}</i>
      </p>
      <template v-if="$fetchState.pending">
        <v-progress-circular size="64" color="primary" indeterminate />
      </template>
      <template v-else>
        <v-row>
          <!--<v-col :cols="12" sm="6" lg="4">
            <VeoUnitWidget :unit="unit" />
          </v-col>-->
          <v-col :cols="12" sm="6">
            <VeoUnitFormsWidget :unit="unit" />
          </v-col>
          <v-col :cols="12" sm="6">
            <VeoUnitObjectWidget :unit="unit" />
          </v-col>
        </v-row>
      </template>
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
// import VeoUnitWidget from '~/components/widgets/VeoUnitWidget.vue'
import VeoUnitFormsWidget from '~/components/widgets/VeoUnitFormsWidget.vue'
import VeoUnitObjectWidget from '~/components/widgets/VeoUnitObjectWidget.vue'

export default Vue.extend({
  components: {
    // VeoUnitWidget,
    VeoUnitFormsWidget,
    VeoUnitObjectWidget,
    VeoPage
  },
  data() {
    return {
      unit: {} as any
    }
  },
  async fetch() {
    this.unit = await this.$api.unit.fetch(this.$route.params.unit)
  },
  head(): any {
    return {
      title: this.$t('unit.index.title')
    }
  },
  computed: {
    title(): string {
      return this.unit.name || ''
    }
  },
  watch: {
    '$route.params': '$fetch'
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-unit-description {
  color: $accent;
}
</style>
