<template>
  <v-footer class="main-footer" v-scroll="onScroll" style="pointer-events: none" color="transparent" inset app fixed height="auto">
    <v-spacer></v-spacer>
    <v-fade-transition origin="center center" hide-on-leave>
      <v-speed-dial right :direction="$vuetify.breakpoint.xs?'top':'left'" key="sd" v-if="isFab">
        <v-btn color="primary" slot="activator" fab class="ma-3">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <slot></slot>
      </v-speed-dial>
      <div key="group" v-else>
        <slot></slot>
      </div>
    </v-fade-transition>
  </v-footer>
</template>
<script lang="ts">
import { Scroll } from "vuetify/lib/directives";
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      isFab: false
    };
  },
  directives: {
    Scroll
  },
  mounted() {
    this.onScroll();
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
  .v-speed-dial, .v-btn {
    pointer-events: auto;
  }

  >>> .v-speed-dial--direction-left .v-speed-dial__list {
    flex-direction: row;
  }
}
</style>
