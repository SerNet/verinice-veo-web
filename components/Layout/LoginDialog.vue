<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" width="500" id="loginDialog">
      <v-btn slot="activator" color="primary" icon>
        <v-avatar size="32" color="#FFF">
          <v-icon color="#888">person</v-icon>
        </v-avatar>
      </v-btn>
      <v-card>
        <v-form ref="form" @submit.prevent="login()">
          <v-card-title class="headline grey lighten-2" primary-title>Login</v-card-title>
          <v-card-text>
            <v-text-field :error="!!error" v-model="username" label="Benutzername" clearable></v-text-field>
            <v-text-field :error="!!error" v-model="password" label="Passwort" clearable type="password"></v-text-field>
            <v-checkbox v-model="savePassword" :label="`Passwort speichern`"></v-checkbox>
            <v-messages color="error" v-if="error" :value="[error]"></v-messages>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="dialog = false">Abbrechen</v-btn>
            <v-btn color="primary" type="submit" flat>Login</v-btn>
          </v-card-actions>
        </v-form>
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
      valid: true,
      dialog: false,
      username: "",
      password: "",
      savePassword: false
    };
  },
  props: {
    error: String
  },
  methods: {
    login() {
      this.$emit("login", {
        username: this.username,
        password: this.password,
        persist: this.savePassword
      });
    }
  }
});
</script>

<style lang="stylus" scoped>
#loginDialog {
}
</style>
