<template>
  <v-container class="text-xs-center">
    <v-layout row>
      <v-flex xs12 lg4 offset-lg4>
        <v-form ref="form" @submit.prevent="submit()">
          <v-text-field :error="!!error" v-model="username" label="Benutzername" clearable></v-text-field>
          <v-text-field :error="!!error" v-model="password" label="Passwort" clearable type="password"></v-text-field>
          <v-checkbox v-model="savePassword" :label="`Passwort speichern`"></v-checkbox>
          <v-messages color="error" v-if="error" :value="[error]"></v-messages>

          <v-divider></v-divider>

          <v-spacer></v-spacer>
          <v-btn color="primary" flat to="/">Abbrechen</v-btn>
          <v-btn color="primary" type="submit" flat>Login</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { helpers as auth } from "~/store/auth";

export default Vue.extend({
  layout: "login",
  components: {},
  computed: {
    ...auth.mapState({
      authError: "error"
    })
  },
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
    ...auth.mapActions({
      login: "login",
      logout: "logout"
    }),
    async submit() {
      const result = await this.login({
        username: this.username,
        password: this.password,
        persist: this.savePassword
      });
      if (result) {
        const redir = this.$store.state.auth.redirection;
        if (redir) {
          this.$router.push(redir);
        }
      }
    }
  }
});
</script>

<style lang="stylus" scoped>
#loginDialog {
}
</style>
