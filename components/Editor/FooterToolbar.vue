<template>
  <v-footer class="main-footer" v-scroll="onScroll" v-height="onScroll" color="transparent" inset app fixed height="auto">
    <v-spacer v-if="isFab"></v-spacer>
    <v-fade-transition origin="center center" hide-on-leave>
      <v-speed-dial v-model="fab" right :direction="$vuetify.breakpoint.xs?'top':'left'" key="sd" v-if="isFab">
        <template v-slot:activator>
          <v-btn color="primary" fab class="ma-3">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <slot></slot>
      </v-speed-dial>
      <v-layout class="ma-2" align-center row key="group" v-else>
        <slot></slot>
      </v-layout>
    </v-fade-transition>
  </v-footer>
</template>
<script lang="ts">
//@ts-ignore
//import { Scroll, Resize } from "vuetify/lib/directives";
import Height from "~/directives/height";
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      fab: false,
      isFab: true
    };
  },
  directives: {
    //Scroll,
    //Resize,
    Height
  },
  mounted() {
    this.onScroll();
  },
  computed: {
    docHeight() {
      return document.documentElement.offsetHeight;
    }
  },
  methods: {
    onScroll(e?: Event) {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = scrollTop + window.innerHeight;

      this.isFab = scrollHeight < document.documentElement.offsetHeight - 32;
    }
  }
});
</script>
<style lang="stylus" scoped>
.main-footer {
  pointer-events: none;

  >>> .v-speed-dial, >>> .v-btn {
    pointer-events: auto;
  }

  >>> .v-speed-dial--direction-left .v-speed-dial__list {
    flex-direction: row;
  }
}
</style>
