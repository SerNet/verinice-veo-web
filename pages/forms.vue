<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12 pa-0">
          <div v-if="$fetchState.pending">
            <div class="text-center mt-6">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </div>
          <div v-else>
            <v-list dense>
              <v-list-item-group>
                <v-list-item v-for="process in processes" :key="process.id" :to="`/forms/07b57947-6259-471e-95cf-5970a40fac3f/${process.id}/`">
                  <v-list-item-content>
                    <v-list-item-title class="primary--text text-uppercase" v-text="process.name" />
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
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
import { IBaseObject } from '../lib/utils'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'

interface IData {
  processes: IBaseObject[]
}

export default Vue.extend({
  components: {
    AppSideContainer
  },
  props: {},
  async fetch() {
    this.processes = await this.$api.process.fetchAll()
  },
  data(): IData {
    return {
      processes: []
    }
  },
  methods: {},
  head() {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped></style>
