<template>
  <v-container class="text-xs-center">
    <v-layout row>
      <v-flex xs12 lg4 offset-lg4>
        <v-form ref="form" @submit.prevent="submit()">
          <v-text-field :error="!!error" v-model="username" label="Benutzername" clearable></v-text-field>
          <v-text-field :error="!!error" v-model="password" label="Passwort" clearable type="password"></v-text-field>
          <v-checkbox v-model="persist" :label="`Eingeloggt bleiben`"></v-checkbox>
          <v-messages color="error" v-if="error" :value="errorMessages"></v-messages>

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
import auth from "~/store/auth";
import { mapState, mapActions, useStore } from "vuex-typesafe-class";

export default Vue.extend({
  layout: "login",
  props: {
    error: String
  },
  components: {},
  computed: {
    ...mapState(auth, {
      authError: "error",
      redirection: "redirection"
    }),
    errorMessage(): string[] {
      return [this.error];
    }
  },
  data() {
    return {
      valid: true,
      dialog: false,
      username: "",
      password: "",
      persist: true
    };
  },
  methods: {
    ...mapActions(auth, {
      login: "login",
      logout: "logout"
    }),
    async submit() {
      const result = await this.login({
        username: this.username,
        password: this.password,
        persist: this.persist
      });

      if (result) {
        const redir = this.redirection;
        if (redir) {
          this.$router.push(redir);
        } else {
          this.$router.push("/");
        }
      }
    }
  },
  async fetch({ store, redirect }) {
    const $auth = useStore(auth, store);
    if ($auth.isAuthorized) {
      redirect("/");
    }
  }
});
</script>

<style lang="stylus" scoped>
#loginDialog {
}
</style>
