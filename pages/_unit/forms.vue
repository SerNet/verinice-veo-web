<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row class="fill-height" no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12" class="pa-0 fullsize-col">
          <div v-if="$fetchState.pending">
            <div class="text-center mt-6">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </div>
          <div v-else>
            <v-list dense>
              <v-list-item v-for="form in forms" :key="form.id" :to="`/${$route.params.unit}/forms/${form.id}/`">
                <v-list-item-content>
                  <v-list-item-title v-text="form.name" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </AppSideContainer>
      <v-col class="flex-shrink-0 flex-grow-1">
        <nuxt-child />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
import { FormSchemaMetas } from '~/types/FormSchema'

interface IData {
  forms: FormSchemaMetas
}

export default Vue.extend({
  components: {
    AppSideContainer
  },
  props: {},
  data(): IData {
    return {
      forms: []
    }
  },
  async fetch() {
    this.forms = await this.$api.form.fetchAll()
  },
  head() {
    return {
      title: 'Willkommen'
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped></style>
