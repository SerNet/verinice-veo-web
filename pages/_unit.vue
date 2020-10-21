<template>
  <div class="fill-height">
    <portal to="toolbar">
      <v-select
        v-if="$auth.profile"
        class="unit-select"
        :items="units"
        item-text="name"
        item-value="id"
        :value="unit"
        hide-details
        flat
        light
        dense
        label="Unit"
        solo
        @change="changeUnit"
      />
      <!--:prepend-inner-icon="!$vuetify.breakpoint.xs?'mdi-domain':''"-->
    </portal>
    <nuxt-child v-if="hasUnit" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { validate } from 'uuid'

export default Vue.extend({
  components: {},
  validate({ params, redirect }) {
    if (validate(params.unit)) {
      return true
    } else {
      redirect('/')
      return false
    }
  },
  props: {},
  data() {
    return { units: [] }
  },
  async fetch() {
    if (this.$auth.profile) {
      this.units = await this.$api.unit.fetchAll()
    }
  },
  computed: {
    hasUnit() {
      return String(this.$route.params.unit) !== 'undefined'
    },
    unit(): string | undefined {
      return this.$route.params.unit || '-'
    }
  },
  methods: {
    changeUnit(e: string) {
      this.$router.push('/' + e)
    }
  }
})
</script>

<style lang="scss" scoped>
.unit-select {
  position: absolute;
  left: 220px;
  top: 13px;
  width: 190px; // Workaround bis sich das Select automatisch verkleinern lässt
}

@media only screen and (max-width: 599px /* 959 */) {
  /*.domain-select {
    left: 120px;
    top: 8px;
    width: 152px;// Workaround bis sich das Select automatisch verkleinern lässt
  }*/
  .unit-select {
    left: 120px;
    top: 8px;
    width: 152px; // Workaround bis sich das Select automatisch verkleinern lässt
  }
}
</style>
