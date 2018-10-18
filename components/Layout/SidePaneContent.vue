<template>
  <v-layout class="sidepane" :class="{right}" row fill-height="">

    <v-flex class="tablist" shrink :order-xs2="right">
      <v-list class="pa-0 fill-height">
        <v-layout fill-height="" column>
          <v-flex shrink v-for="item in items" :key="item.title">
            <v-list-tile class="tab" :class="{active: item.active}" @click.stop>
              <v-list-tile-action>
                <v-icon :color="item.active?'primary':'grey'">{{item.icon}}</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex shrink justify-end="">
            <v-list-tile class="tab bottom" @click="toggleCollapse">
              <v-list-tile-action>
                <v-icon color="grey">{{(value?right:!right)?'chevron_right':'chevron_left'}}</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-flex>
        </v-layout>
      </v-list>
    </v-flex>
    <v-flex v-show="value" class="sidepane-content" :order-xs1="right" :class="{'text-xs-right': right}">
      <div style="width: 100%; height: 100%;  position: relative">
        <slot></slot>
      </div>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import Vue from "vue";
import SidePaneView from "~/components/Layout/SidePaneView.vue";

export default Vue.extend({
  created() {
    if (this.$route.path.includes(".map")) return;
  },
  components: {
    SidePaneView
  },
  props: {
    value: Boolean,
    right: Boolean
  },
  data() {
    return {
      items: [
        { icon: "folder" },
        { icon: "folder", active: true },
        { icon: "folder" },
        { icon: "folder" }
      ]
    };
  },
  methods: {
    toggleCollapse(this: Vue & { value: Boolean }) {
      this.$emit("input", !this.value);
    }
  }
});
</script>
<style lang="stylus" scoped>
.sidepane {
  width: 100%;

  &.right {
    .tablist {
      .tab {
        border-left: 1px solid #E0E0E0;
        border-right-width: 0;
      }

      &:before {
        border-left: 1px solid #E0E0E0;
        border-right: none;
      }

      .spacer {
        border-left: 1px solid #E0E0E0;
        border-right: none;
      }
    }
  }

  .sidepane-content {
    background: #FFF;
    width: 100%;
  }

  .tablist {
    z-index: 1;
    background: #FAFAFA;
    position: relative;
    width: 64px;

    .tab {
      border: 0px solid #E0E0E0;
      border-right-width: 1px;

      .bottom {
        position: absolute;
        bottom: 0;
      }

      &.active {
        border-top: 1px solid #E0E0E0;
        border-bottom: 1px solid #E0E0E0;
        border-left-width: 0px;
        border-right-width: 0px;
        background: white;

        >>> .v-list__tile {
          &:hover {
            background-color: white !important;
          }
        }
      }
    }

    .spacer {
      border-right: 1px solid #E0E0E0;
    }
  }

  .v-list__tile {
    padding-left: 0;
    padding-right: 0;
  }

  .v-list__tile__action {
    justify-content: center;
    width: 32px;
    min-width: 32px;
  }
}
</style>

