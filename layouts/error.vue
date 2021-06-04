<template>
  <VeoPage fullsize>
    <v-row class="fill-height flex-column text-center align-center">
      <v-spacer />
      <v-col>
        <v-icon
          style="font-size: 8rem; opacity: 0.5;"
          color="primary"
        >
          mdi-information-outline
        </v-icon>
      </v-col>
      <v-col
        cols="auto"
        class="text-left"
      >
        <h3>{{ $t('error.title') }}:</h3>
        <p>{{ error.message }}</p>
        <v-card-subtitle>Error code: {{ error.statusCode }}</v-card-subtitle>
      </v-col>
      <v-spacer />
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head(): any {
    return {
      title: 'verinice.',
      titleTemplate: '%s - verinice.'
    };
  }
});
</script>

<style lang="scss" scoped></style>
