<template>
  <v-container class="elementHeader" fluid>
    <v-expansion-panel class="elevation-0" v-model="showHeader" expand>
      <v-expansion-panel-content>
        <div slot="header" class="expansionHeader">
          <v-layout row>
            <v-flex>
              <veo-bread-crumb></veo-bread-crumb>
            </v-flex>
            <v-btn icon>
              <v-icon>launch</v-icon>
            </v-btn>
          </v-layout>
        </div>
        <v-layout row wrap>
          <v-flex>
            <v-container>
              <v-avatar size="32" color="grey">
                <span class="white--text headline">A</span>
              </v-avatar>
              <span>Titel</span>
            </v-container>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex>
            <v-container text-xs-right>
              <span>Zuletzt geändert von Markus Werner vor 12 Stunden</span>
              <v-avatar size="32" color="grey">
                <span class="white--text headline">B</span>
              </v-avatar>
            </v-container>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex shrink>
            <count-button :count="8" icon="list" text="Attribute" href="#"></count-button>
            <count-button :count="6" icon="format_align_right" text="Unterelemente" href="#"></count-button>
            <v-menu offset-y class="element_add_menu hidden-xs-only">
              <v-btn slot="activator" class="elevation-0 ma-0 pa-0">
                <v-icon>add</v-icon>
                <v-icon>arrow_drop_down</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile v-for="(item, index) in items" :key="index">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex shrink>
            <count-button :count="12" icon="history" text="Änderungen" href="#"></count-button>
            <count-button :count="2" icon="link" text="Links" href="#"></count-button>
            <v-menu offset-y class="element_add_menu hidden-sm-and-up">
              <v-btn slot="activator" class="elevation-0 ma-0 pa-0">
                <v-icon>add</v-icon>
                <v-icon>arrow_drop_down</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile v-for="(item, index) in items" :key="index">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>
        </v-layout>
      </v-expansion-panel-content>
    </v-expansion-panel>

  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

import VeoBreadCrumb from "~/components/VeoBreadCrumb.vue";
import CountButton from "~/components/CountButton.vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {
    VeoBreadCrumb,
    CountButton
  },
  data() {
    return {
      showHeader: [true],
      items: [
        { title: "Click Me" },
        { title: "Click Me" },
        { title: "Click Me" },
        { title: "Click Me 2" }
      ]
    };
  }
});
</script>

<style lang="stylus" scoped>
.elementHeader {
  margin: 0;
  padding: 0;
  max-width: none;
  display: inline-block;

  // height: 80px;
  .v-expansion-panel {
    >li {
      background-color: transparent;
      padding: 10px 10px 0 10px;

      >>> .v-expansion-panel__header {
        padding: 0;
        border-bottom: 1px solid #ccc;

        .expansionHeader {
        }
      }
    }
  }
}

.element_add_menu {
  margin: 5px;
  padding: 0;

  .v-btn {
    background-color: #fafafa !important;
    border: 1px solid #ccc;
    min-width: 58px;
  }
}
</style>
