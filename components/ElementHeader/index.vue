<template>
  <v-container class="elementHeader" fluid>
    <!--
      // TODO: Waiting for Fix: https://github.com/vuetifyjs/vuetify/issues/5580
    -->
    <v-expansion-panel class="elevation-0" :value="showHeader" @input="changeExpand" expand>
      <v-expansion-panel-content>
        <div slot="header" class="expansionHeader">
          <v-layout row>
            <v-flex>
              <v-breadcrumbs :items="breadcrumbItems">
                <v-icon slot="divider">chevron_right</v-icon>
              </v-breadcrumbs>
            </v-flex>
            <v-btn icon target="_blank" href="?standalone=1">
              <v-icon>launch</v-icon>
            </v-btn>
          </v-layout>
        </div>
        <v-layout row wrap>
          <v-flex v-if="false">
            <v-container class="pl-0">
              <v-avatar size="32" color="grey">
                <span class="white--text headline">A</span>
              </v-avatar>
              <span class="ml-2">Titel</span>
            </v-container>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex>
            <v-container class="pr-0" text-xs-right>
              <span class="mr-2">Zuletzt geändert von Markus Werner vor 12 Stunden</span>
              <v-avatar size="32" color="grey">
                <span class="white--text headline">B</span>
              </v-avatar>
            </v-container>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex shrink>
            <count-button class="ml-0" :count="numAttrbutes" icon="list" text="Attribute" :to="'/elements/'+id"></count-button>
            <count-button :count="numChildren" icon="format_align_right" text="Unterelemente" :to="'/browser/'+id"></count-button>
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
            <count-button :count="numHistory" icon="history" text="Änderungen" right :to="'/history/'+id"></count-button>
            <count-button class="mr-0" :count="numLinks" icon="link" text="Links" right :to="'/links/'+id"></count-button>
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

import CountButton from "~/components/ElementHeader/CountButton.vue";

export default Vue.extend({
  props: {
    numAttrbutes: { type: Number, default: 0 },
    numChildren: { type: Number, default: 0 },
    numHistory: { type: Number, default: 0 },
    numLinks: { type: Number, default: 0 },
    breadcrumb: { type: Array },
    id: { type: String },
    value: { type: Boolean }
  },
  methods: {
    changeExpand(values: boolean[]) {
      this.$emit("input", values[0]);
    }
  },
  components: {
    CountButton
  },
  data() {
    return {
      items: [{ title: "Neuen Link" }, { title: "Neues Unterelement" }]
    };
  },
  computed: {
    showHeader(): boolean[] {
      return [this.value];
    },
    breadcrumbItems(): any[] {
      const id = this.$route.params.id;
      return this.breadcrumb.map((item: any) => ({
        disabled: item.id == id,
        to: "/elements/" + item.id,
        text: item.title
      }));
    }
  }
});
</script>

<style lang="stylus" scoped>
.elementHeader {
  margin: 0;
  padding: 0;
  max-width: none;
  display: inline-block;

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
