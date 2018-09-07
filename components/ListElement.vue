<template>
    <li>
        <span>{{idShort}}</span>
        <span>&nbsp;&middot;&nbsp;</span>
        <span>{{title}}</span>
        <a href="#" @click="loeschMich()">X</a>
    </li>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    id: String,
    title: String
  },
  computed: {
    idShort: function() {
      return this.id && this.id.substr(0, 4);
    }
  },
  methods: {
    loeschMich() {
      if (prompt("Willst du mich loeschen?") == "y") {
        this.$emit("loeschen");
      }
    }
  }
});
</script>
<style lang="stylus" scoped>
</style>


