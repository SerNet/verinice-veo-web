<template>
  <div>
    <h4>{{ $t('created') }}</h4>
    <v-row>
      <v-col>
        <v-icon>mdi-account</v-icon>
        {{ object.updatedBy }}
      </v-col>
      <v-col>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        {{ new Date(object.updatedAt).toLocaleString() }}
      </v-col>
    </v-row>
    <v-divider />
    <h4>{{ $t('updated') }}</h4>
    <v-row>
      <v-col>
        <v-icon>mdi-account</v-icon>
        {{ object.createdBy }}
      </v-col>
      <v-col>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        {{ new Date(object.createdAt).toLocaleString() }}
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    object: Object as Prop<IVeoEntity>
  }
})
</script>

<i18n>
{
  "en": {
    "created": "Created",
    "updated": "Updated"
  },
  "de": {
    "created": "Erstellt",
    "updated": "Bearbeitet"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
