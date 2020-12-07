<template>
  <v-navigation-drawer app :class="{'v-application--is-rtl': right}" clipped :mini-variant="drawer" :permanent="!$vuetify.breakpoint.xs" :right="right" @input="$emit('update:drawer', $event)" @mouseenter.native="onMouseEnter()" @mouseleave.native="onMouseLeave()">
    <div class="d-flex flex-column fill-height">
      <v-list nav dense rounded>
        <v-list-item v-for="item in filteredItems" :key="item.name" link :to="item.to" :exact="item.exact" :disabled="item.disabled" active-class="veo-active-link-item">
          <v-list-item-icon v-if="item.icon">
            <v-icon v-text="item.icon" />
          </v-list-item-icon>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-spacer />
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'

export interface INavItem {
  name: string,
  icon: string,
  exact?: boolean,
  to: string,
  visible?: boolean,
  disabled: boolean
}

export default Vue.extend({
  props: {
    offset: {
      type: [Number, String],
      default: 0
    },
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
    return {
      openedOnHover: false as boolean
    }
  },
  computed: {
    filteredItems(): INavItem[] {
      return this.items.filter(item => item.visible !== false)
    }
  },
  mounted() {
    // Closes the menu if the cursor leaves the browser
    document.addEventListener('mouseleave', this.onMouseLeave)
  },
  destroyed() {
    // Closes the menu if the cursor leaves the browser
    document.removeEventListener('mouseleave', this.onMouseLeave)
  },
  methods: {
    onMouseEnter() {
      // If this.drawer is true, the mini-variant is displayed
      if (this.drawer) {
        this.openedOnHover = true
        setTimeout(() => {
          if (this.openedOnHover) {
            this.$emit('update:drawer', false)
          }
        }, 200)
      }
    },
    onMouseLeave() {
      if (!this.drawer && this.openedOnHover) {
        this.$emit('update:drawer', true)
      }
      this.openedOnHover = false
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-application--is-rtl {
  ::v-deep .v-tabs-bar {
    transform: scaleX(-1);
    .v-tab {
      transform: scaleX(-1);
    }
  }
}

.veo-active-link-item {
  color: $primary !important;
}
</style>
