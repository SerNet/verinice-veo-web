<template>
  <v-layout align-center fill-height row justify-center class="error-page">
    <v-flex class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48">
        <path
          d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"
        ></path>
      </svg>

      <div class="title">{{ message }}</div>
      <p class="description" v-if="statusCode === 404">
        <nuxt-link class="error-link" to="/">Zurück zur Startseite</nuxt-link>
      </p>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { sep } from "path";

export default Vue.extend({
  props: {
    error: {
      type: [Object, Error],
      default: () => ({
        statusCode: 500,
        message: "Fehler beim Laden der Komponente"
      })
    }
  },
  computed: {
    statusCode(): number {
      return (this.error && this.error.statusCode) || 500;
    },
    message(): string {
      const msg = this.error.message || `<%= messages.client_error %>`;
      switch (msg) {
        case "This page could not be found":
          return "Die angeforderte Seite konnte nicht gefunden werden.";
        default:
          return msg;
      }
    }
  }
});
</script>

<style scoped>
.error-page {
  padding: 1rem;
  color: #47494e;
  text-align: center;

  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
}
.error-page .error {
  max-width: 450px;
  background-color: transparent !important;
}
.error-page .title {
  font-size: 1.5rem;
  margin-top: 15px;
  color: #47494e;
  margin-bottom: 8px;
}
.error-page .description {
  color: #7f828b;
  line-height: 21px;
  margin-bottom: 10px;
}
.error-page a {
  color: #7f828b !important;
  text-decoration: none;
}
.error-page .logo {
  position: fixed;
  left: 12px;
  bottom: 12px;
}
</style>
