<template>
  <v-container class="elementHeader" fluid>
    <v-expansion-panel class="elevation-0" :value="showHeader" @input="changeExpand" expand>
      <!-- TODO: expand funktioniert gerade nicht -->
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
          <v-flex>
            <v-container class="pl-0">
              <v-avatar size="32" color="grey">
                <span class="white--text headline">{{title?title.substr(0,1).toUpperCase():""}}</span>
              </v-avatar>
              <span class="ml-2">{{title}}</span>
            </v-container>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex v-if="lastChange && lastChange.author && lastChange.timestamp">
            <v-container class="pr-0" text-xs-right>
              <!-- TODO -->
              <span class="mr-2">
                Zuletzt geändert von
                <span class="font-weight-bold">{{lastChange.author}}</span>
                <span class="font-weight-bold">{{lastChange.timestamp | relativeDate }}</span>
              </span>
              <v-avatar size="32" color="grey">
                <span class="white--text">{{lastChange.author.substr(0,1).toUpperCase()}}</span>
              </v-avatar>
            </v-container>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex shrink>
            <count-button :count="numAttributes" icon="list" text="Attribute" :to="'/editor/'+id"></count-button>
            <count-button :count="numChildren" icon="format_align_right" text="Unterelemente" :to="'/browser/'+id"></count-button>
            <v-menu offset-y class="element_add_menu hidden-xs-only">
              <v-btn slot="activator" class="elevation-0 ma-0 pa-0">
                <v-icon>add</v-icon>
                <v-icon>arrow_drop_down</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile v-for="(item, index) in createMenu" :key="index">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex shrink>
            <count-button :count="numHistory" icon="history" text="Änderungen" right :to="'/history/'+id"></count-button>
            <count-button :count="numLinks" icon="link" text="Links" right :to="'/links/'+id"></count-button>
            <v-menu offset-y class="element_add_menu hidden-sm-and-up">
              <v-btn slot="activator" class="elevation-0 ma-0 pa-0">
                <v-icon>add</v-icon>
                <v-icon>arrow_drop_down</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile v-for="(item, index) in createMenu" :key="index">
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
import moment from "moment";
import { helpers as activeElement } from "~/store/elements/active";
import CountButton from "~/components/ElementHeader/CountButton.vue";

export default Vue.extend({
  props: {
    value: { type: Boolean }
  },
  components: {
    CountButton
  },
  methods: {
    changeExpand(values: boolean[]) {
      this.$emit("input", values[0]);
    }
  },
  data() {
    return {
      createMenu: [{ title: "Neuen Link" }, { title: "Neues Unterelement" }]
    };
  },
  computed: {
    ...activeElement.mapGetters({
      breadcrumb: "breadcrumb",
      element: "item",
      links: "links",
      history: "history",
      children: "children"
    }),
    showHeader(): boolean[] {
      return [this.value];
    },
    breadcrumbItems(): any[] {
      const id = this.$route.params.id;
      const bc = this.breadcrumb.map((item: any) => ({
        disabled: item.id == id,
        to: "/editor/" + item.id,
        text: item.title
      }));
      return bc;
    },
    id() {
      return this.element ? this.element["id"] : "";
    },
    title(): string {
      return this.element ? this.element.title : "test";
    },
    numAttributes() {
      return this.element ? Object.keys(this.element).length : 0;
    },
    numLinks(): number {
      return this.links ? this.links.length : 0;
    },
    numChildren(): number {
      return this.children ? this.children.length : 0;
    },
    numHistory(): number {
      return this.history ? this.history.length : 0;
    },
    lastChange(): any {
      if (this.history.length > 0) {
        const last = this.history[0];
        if (last && last.author && last.timestamp) {
          return {
            author: last.author,
            timestamp: last.timestamp
          };
        }
      }
    }
  },
  filters: {
    relativeDate: function(date) {
      moment.locale("de");
      return moment(date).fromNow();
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
