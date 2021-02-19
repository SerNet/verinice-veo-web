<template>
  <VeoPage :title="title" fullsize>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-btn-toggle mandatory :value="1" color="primary" dense>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="navigateList()">
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <template #default>
              Listenansicht
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on">
                <v-icon>mdi-file-tree</v-icon>
              </v-btn>
            </template>
            <template #default>
              Baumansicht
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" :disabled="$route.params.entity === '-'" @click="navigateDetails()">
                <v-icon>mdi-file</v-icon>
              </v-btn>
            </template>
            <template #default>
              Detailansicht
            </template>
          </v-tooltip>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto" class="mr-4">
        <v-btn outlined color="primary" @click="navigateCreate()">Erstellen</v-btn>
      </v-col>
    </v-row>
    <VeoObjectTree :items="displayedObjects" @fetch="$fetch()" />
  </VeoPage>
</template>
<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectTree from '~/components/objects/VeoObjectTree.vue'
import VeoMenuButton from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import { capitalize } from 'lodash'

export default Vue.extend({
  components: {
    VeoPage,
    VeoObjectTree,
    VeoMenuButton
  },
  async fetch() {
    if (this.$route.params.entity !== '-') {
      this.objects = await this.$api.entity.fetchSubEntities(this.$route.params.type, this.$route.params.entity)
    } else {
      this.objects = await this.$api.entity.fetchAll(this.$route.params.type)
    }
    this.maxObjects = this.objects.length
    this.currentPage = 0
  },
  computed: {
    menuItems() {
      return [
        {
          disabled: false,
          eventName: 'create-scope',
          name: 'Scope erstellen'
        },
        {
          disabled: true,
          eventName: 'create-group',
          name: 'Group erstellen'
        },
        {
          disabled: false,
          eventName: 'create-object',
          name: 'Object erstellen'
        }
      ]
    },
    title(): string {
      return capitalize(this.$route.params.type)
    },
    start(): number {
      const start = this.currentPage * this.itemsPerPage
      return this.maxObjects === 0 ? 0 : start
    },
    end(): number {
      const end = this.currentPage * this.itemsPerPage + this.itemsPerPage
      return end > this.maxObjects ? this.maxObjects : end
    },
    displayedObjects(): IVeoEntity[] {
      return this.objects.slice(this.start, this.end)
    }
  },
  data() {
    return {
      objects: [] as IVeoEntity[],
      currentPage: 0 as number,
      maxObjects: 0 as number,
      itemsPerPage: 10 as number
    }
  },
  methods: {
    navigateList() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/list`
      )
    },
    navigateDetails() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
      )
    },
    navigateCreate() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/create`
      )
    }
  }
})
</script>

<style lang="scss" scoped></style>
