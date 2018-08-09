<template>
  <div class="__nuxt-error-page">
    <div class="error-page">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48">
        <path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
      </svg>

      <div class="title">{{ message }}</div>
      <p class="description" v-if="statusCode === 404">
        <nuxt-link class="error-link" to="/">Zurück zur Startseite</nuxt-link>
      </p>

    </div>
  </div>
</template>

<script>
const pkg = require("../package.json");

export default {
  name: "nuxt-error",
  props: ["error"],
  head() {
    return {
      title: pkg.name + " | " + this.message
    };
  },
  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500;
    },
    message() {
      const err = this.error.message || "<%= messages.client_error %>";
      switch (err) {
        case "This page could not be found":
          return "Die Seite konnte nicht gefunden werden";
      }
      return err;
    }
  }
};
</script>

<style>
.__nuxt-error-page {
  padding: 1rem;

  color: #47494e;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
}

.__nuxt-error-page .error {
  max-width: 450px;
  padding: 10px 20px;
}

.__nuxt-error-page .title {
  font-size: 1.5rem;
  margin-top: 15px;
  color: #47494e;
  margin-bottom: 8px;
}

.__nuxt-error-page .description {
  color: #7f828b;
  line-height: 21px;
  margin-bottom: 10px;
}

.__nuxt-error-page a {
  color: #7f828b !important;
  text-decoration: none;
}

.__nuxt-error-page .logo {
  position: fixed;
  left: 12px;
  bottom: 12px;
}
</style>
