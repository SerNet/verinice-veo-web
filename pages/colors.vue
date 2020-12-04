<template>
  <div style="width: 80%; margin: 0 auto">
    <v-row class="align-content-space-between">
      <v-col>
        <v-card style="width: 400px; height: 300px;">
          <v-card-title>Title</v-card-title>
          <v-card-subtitle>A subtitle</v-card-subtitle>
          <v-card-text>A text maybe<br>spanning multiple paragraphs</v-card-text>
          <v-card-actions>
            <v-btn text>Some action</v-btn>
            <v-btn icon><v-icon>mdi-edit</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <v-text-field label="some input" />
        <v-textarea label="some text" />
        <v-select label="some select" :items="[{text: 'Entry One', value: 1},{text: 'Entry Two', value: 2},{text: 'Entry Three', value: 3}]" />
        <v-checkbox label="Something to check" />
      </v-col>
    </v-row>
    <v-btn @click="alert = true">Show alerts</v-btn>
    <v-row>
      <v-col>
        <VeoAlert v-model="alert" :type="type.ERROR" headline="Alert title">
          <p>Some alert text, maybe spanning multiple lines depending on screen size and paragraph length</p>
        </VeoAlert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <VeoAlert v-model="alert" :type="type.INFO" headline="Alert title">
          <p>Some alert text, maybe spanning multiple lines depending on screen size and paragraph length</p>
        </VeoAlert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <VeoAlert v-model="alert" :type="type.SUCCESS" title="Alert title success">
          <p>Some alert text, maybe spanning multiple lines depending on screen size and paragraph length</p>
        </VeoAlert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <VeoAlert v-model="alert" :type="type.WARNING" headline="Alert title">
          <p>Some alert text, maybe spanning multiple lines depending on screen size and paragraph length</p>
        </VeoAlert>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoAlert, { ALERT_TYPE } from '~/components/layout/VeoAlert.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

export default Vue.extend({
  components: {
    VeoAlert
  },
  data() {
    return {
      alert: false as boolean,
      type: ALERT_TYPE
    }
  },
  mounted() {
    this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: 'Asd123', title: 'Ein Titel' })
  }
})
</script>

<style lang="scss" scoped>
.veo-alert ::v-deep i {
  align-self: center;
}
</style>
