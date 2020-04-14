<template>
  <v-menu v-model="value" :close-on-content-click="false" min-width="200" nudge-bottom="5" offset-y origin="top right">
    <template #activator="{ on }">
      <v-btn class="mr-0" icon dark v-on="on">
        <v-avatar size="48" color="secondary">
          <span class="white--text headline">{{ username.substr(0,1).toUpperCase() }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar color="secondary">
            <v-icon class="white--text headline">{{ username.substr(0,1).toUpperCase() }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <span>
              {{ prename }}
              {{ lastname }}
            </span>
            <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-card-actions>
        <v-btn color="primary" text @click="$emit('logout')">Logout</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {
    prename: { type: String, default: '' },
    lastname: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  data() {
    return {
      value: false
    }
  },
  methods: {}
})
</script>

<style lang="stylus" scoped>
</style>
