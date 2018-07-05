<template>
  <v-layout row>
    TEST
  </v-layout>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";
import { Store } from "vuex";
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import VeoForm from "~/components/VeoForm.vue";
import VeoBreadcrumb from "~/components/VeoBreadcrumb.vue";



@Component({
  
})
export default class extends Vue {
  
}
</script>

<style lang="stylus" scoped>
.tree-nav {
  position: fixed;
  top: 64px;
  left: 80px;
  bottom: 0;
  width: 300px;
}
</style>
