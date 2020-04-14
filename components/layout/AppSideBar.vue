<template>
  <v-navigation-drawer v-if="route || items.length > 0" v-model="drawer" :class="{'v-application--is-rtl': right}" :right="right" :floating="!route" :width="route?width:64" permanent clipped app>
    <v-tabs
      class="nav-tabs"
      active-class="nav-tab-active"
      slider-size="3"
      background-color="#fafafa"
      vertical
    >
      <v-tab v-for="item in items" :key="item.name" class="nav-tab" :title="item.name" :to="item.to" :exact="item.exact">
        <v-icon v-if="item.icon" v-text="item.icon">mdi-folder</v-icon>
      </v-tab>
      <v-tabs-items>
        <component :is="route" v-if="route" />
      </v-tabs-items>
    </v-tabs>
  </v-navigation-drawer>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Component } from 'vue-router/types/router'
import { IItem } from '~/plugins/navigation'

export default Vue.extend({
  props: {
    param: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    } as PropOptions<IItem[]>,
    right: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 360
    }
  },
  data() {
    return {
      drawer: undefined as boolean | undefined
    }
  },
  computed: {
    route(): Component | undefined {
      const routeName = String(this.$route.query[this.param])
      return (routeName && this.$router.resolve(routeName).resolved.matched[0]?.components.default) || undefined
    }
  }
})
</script>
<style lang="scss" scoped>

.v-application--is-rtl {
  ::v-deep .v-tabs-bar {
    transform: scaleX(-1);
    .v-tab {
      transform: scaleX(-1);
    }
  }
}

.nav-tabs {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .nav-tab {
    width: 64px;
    min-width: 64px;
  }

  ::v-deep {
    .v-tabs-bar {
      &:before {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        height: 100%;
        background-color: #e0e0e0;
        z-index: 0;
      }
    }

    .v-tab {
      min-width: 64px;
    }

    .v-window {
      border-top: 1px solid #e0e0e0
    }
  }

  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  .nav-tab-active {
    background: white;
    border: 1px solid #e0e0e0;
    border-width: 1px 0 !important;
  }
}
</style>
