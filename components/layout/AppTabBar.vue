<template>
  <v-navigation-drawer v-if="filteredItems.length > 0" :value="drawer" :class="{'v-application--is-rtl': right}" :right="right" :floating="true" width="64" :permanent="!$vuetify.breakpoint.xs" clipped app @input="$emit('update:drawer', $event)">
    <v-tabs
      class="nav-tabs"
      active-class="nav-tab-active"
      slider-size="3"
      background-color="#fafafa"
      vertical
    >
      <v-tab v-for="item in filteredItems" :key="item.name" class="nav-tab" :title="item.name" :to="item.to" :exact="item.exact">
        <v-icon v-if="item.icon" v-text="item.icon">mdi-folder</v-icon>
      </v-tab>
    </v-tabs>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'

interface INavItem {
  name: string,
  icon: string,
  to: string,
  visible?: boolean
}

export default Vue.extend({
  props: {
    items: {
      type: Array,
      default: () => []
    } as PropOptions<INavItem[]>,
    right: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 360
    },
    drawer: {
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {}
  },
  computed: {
    filteredItems(): INavItem[] {
      return this.items.filter(item => item.visible !== false)
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

    .v-tabs-slider-wrapper {
      height: 48px !important
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
