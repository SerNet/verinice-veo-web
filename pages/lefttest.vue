<template>
  <div>LEFTTERST {{test}}</div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  created() {
    console.log("lefttest.vue", "created");
  },
  data() {
    return { xtest: 1234 };
  },
  async asyncData({ side }: any) {
    console.log("ASYNC DATA");
    return { test: side };
  },
  async fetch() {
    console.log("lefttest.vue", "fetch");
  }
});
</script>
