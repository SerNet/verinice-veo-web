<template>
  <v-toolbar app color="primary" dark="" style="overflow:hidden" :clipped-left="clipped">
    <main-toolbar-logo/>
    <v-toolbar-side-icon light class="hidden-md-and-up" @click.stop="toggleDrawer()"/>
    <v-layout class="hidden-sm-and-down" row justify-space-around style="margin-left: 200px;">
      <v-flex xs12 sm6>
        <v-text-field solo light  single-line prepend-icon="search" label="In verinice suchen"/>
      </v-flex>
    </v-layout>
    <v-spacer class="hidden-md-and-up"/>
    <v-btn class="hidden-md-and-up" icon>
      <v-icon>search</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>more_vert</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import MainToolbarLogo from "~/components/MainLayout/MainToolbarLogo.vue";
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";

@Component({
  components: {
    MainToolbarLogo
  },
  props: ["clipped", "value"]
})
export default class MainToolbar extends Vue {
  toggleDrawer() {
    this.$emit("click-side-icon");
  }
}
</script>

<style lang="stylus" scoped>
>>> .v-toolbar__content {
  padding-left: 0;
}
</style>

