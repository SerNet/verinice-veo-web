<template>
  <div>
    <v-alert :value="value === 'success'" dense dark transition="slide-y-transition" type="success" class="mt-5">
      Erfolgreich durchgeführt!
    </v-alert>
    <v-alert :value="value === 'error'" dense dark transition="slide-y-transition" type="error" class="mt-5">
      Error aufgetreten!
    </v-alert>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AppStateAlert',
  props: {
    value: { type: String, default: '' },
    stateAfterAlert: { type: String, default: '' }
  },
  data() {
    return {
      transitionDuration: 2000
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newState) {
        if (['success', 'error'].includes(newState)) {
          setTimeout(() => {
            this.$emit('input', this.stateAfterAlert)
          }, this.transitionDuration)
        }
      }
    }
  }
})
</script>

<style scoped></style>
