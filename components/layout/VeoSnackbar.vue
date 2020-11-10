<template>
  <v-snackbar v-model="visible" bottom color="white" :timeout="computedTimeout" :style="{'paddingBottom': ($vuetify.application.bottom||0)+'px'}">
    <v-row dense>
      <v-col class="flex-grow-0">
        <v-icon v-if="type === 'success' || type === 'successPermanent'" color="success">mdi-checkbox-marked-circle-outline</v-icon>
        <v-icon v-else-if="type === 'error'" color="error">mdi-close-circle-outline</v-icon>
        <v-icon v-else-if="type === 'info'" color="info">mdi-information-outline</v-icon>
        <v-progress-circular v-else-if="type === 'working'" indeterminate :size="24" :width="3" color="primary" />
      </v-col>
      <v-col style="color: black;">
        {{ text }}
      </v-col>
      <v-col v-if="type != 'success'" class="flex-grow-0">
        <v-btn text class="ml-0" color="black" @click="visible = false"><span style="color: black;" /></v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'
import { VeoEvents } from '../../types/VeoGlobalEvents'

export type SnackbarType = 'error' | 'success' | 'successPermanent' | 'working' | 'info'

export default Vue.extend({
  data() {
    return {
      text: '' as string,
      type: 'success' as SnackbarType,
      visible: false as boolean
    }
  },
  computed: {
    computedTimeout(): Number {
      switch (this.type) {
        case 'success':
          return 2000
        default:
          return 0
      }
    }
  },
  created() {
    this.$root.$on(VeoEvents.SNACKBAR_SUCCESS, (text: string) => {
      this.text = text
      this.type = 'success'
      this.visible = true
    })
    this.$root.$on(VeoEvents.SNACKBAR_SUCCESS_PERSISTENT, (text: string) => {
      this.text = text
      this.type = 'successPermanent'
      this.visible = true
    })
    this.$root.$on(VeoEvents.SNACKBAR_ERROR, (text: string) => {
      this.text = text
      this.type = 'error'
      this.visible = true
    })
    this.$root.$on(VeoEvents.SNACKBAR_INFO, (text: string) => {
      this.text = text
      this.type = 'info'
      this.visible = true
    })
    this.$root.$on(VeoEvents.SNACKBAR_WORKING, (text: string) => {
      this.text = text
      this.type = 'working'
      this.visible = true
    })
    this.$root.$on(VeoEvents.SNACKBAR_CLOSE, () => {
      this.visible = false
    })
  }
})
</script>

<style lang="scss" scoped>
  .v-snack {
    margin-top: env(safe-area-inset-top) !important;
    margin-bottom: env(safe-area-inset-bottom) !important;
  }
</style>
