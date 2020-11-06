<template>
  <div class="fill-height">
    <nuxt-child v-if="hasUnit" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { validate } from 'uuid'

export default Vue.extend({
  validate({ params, redirect }) {
    if (validate(params.unit)) {
      return true
    } else {
      redirect('/')
      return false
    }
  },
  computed: {
    hasUnit() {
      return String(this.$route.params.unit) !== 'undefined'
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
}
</style>
