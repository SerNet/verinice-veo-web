<template>
  <v-menu v-model="value" :close-on-content-click="false" offset-y origin="top right">
    <v-btn icon slot="activator" dark>
      <v-avatar size="32" color="secondary">
        <span class="white--text headline">{{username.substr(0,1).toUpperCase()}}</span>
      </v-avatar>
    </v-btn>
    <v-card>
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar color="secondary">
            <span class="white--text headline">{{username.substr(0,1).toUpperCase()}}</span>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{username}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" flat @click="$emit('logout')">Logout</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  components: {},
  data() {
    return {
      value: false
    };
  },
  props: {
    username: String
  },
  methods: {}
});
</script>

<style lang="stylus" scoped>
</style>
