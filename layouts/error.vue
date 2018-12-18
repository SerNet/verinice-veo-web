<template>
  <error :error="error"></error>
</template>

<script>
const pkg = require("../package.json");

import ErrorCmp from "~/components/Error";

export default {
  components: {
    Error: ErrorCmp
  },
  name: "nuxt-error",
  props: ["error"],
  head() {
    return {
      title: "Fehler"
    };
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
