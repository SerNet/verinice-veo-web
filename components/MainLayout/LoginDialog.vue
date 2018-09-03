<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" width="500" id="loginDialog">
      <v-btn slot="activator" color="primary" icon>
        <v-icon>person</v-icon>
      </v-btn>
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>Login</v-card-title>
        <v-card-text>
          <v-text-field v-model="username" label="Benutzername" clearable></v-text-field>
          <v-text-field v-model="password" label="Passwort" clearable type="password"></v-text-field>
          <v-checkbox v-model="savePassword" :label="`Passwort speichern`"></v-checkbox>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="dialog = false">Abbrechen</v-btn>
          <v-btn color="primary" flat @click="dialog = false">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  components: {},
  data() {
    return {
      dialog: false,
      username: "",
      password: "",
      savePassword: false
    };
  },
  props: [],
  methods: {}
});
</script>

<style lang="stylus" scoped>
#loginDialog {
}
</style>
