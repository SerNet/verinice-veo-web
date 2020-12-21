<template>
  <v-snackbar :value="value" bottom color="white" :timeout="5000" class="ma-0 pa-0" :style="{'paddingBottom': ($vuetify.application.bottom||0)+'px'}">
    <v-row dense class="align-center">
      <v-col cols="auto">
        <v-icon color="success">mdi-check-circle-outline</v-icon>
      </v-col>
      <v-col cols="auto" class="accent--text" style="font-size: 1.35em;">
        {{ text }}
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    text: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep .v-snack__content {
  padding: 7px 8px;
}
</style>
