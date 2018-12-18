<template>
  <v-container class="elementHeader" fluid>
    <v-expansion-panel class="elevation-0" ref="panels" :value="showHeader" @input="changeExpand" expand>
      <v-expansion-panel-content>
        <div slot="header" class="expansionHeader">
          <v-layout align-center row @click.stop.prevent>
            <v-flex @click.stop.prevent>
              <v-breadcrumbs class="pl-1" @click.stop.prevent :items="breadcrumbItems">
                <v-icon slot="divider">chevron_right</v-icon>
              </v-breadcrumbs>
            </v-flex>
            <v-btn @click.stop icon target="_blank" href="?standalone=1">
              <v-icon>launch</v-icon>
            </v-btn>
          </v-layout>
        </div>
        <v-layout row wrap>
          <v-flex>
            <v-container class="px-2">
              <v-avatar size="32" color="grey">
                <span class="white--text headline">{{title?title.substr(0,1).toUpperCase():""}}</span>
              </v-avatar>
              <span class="ml-2 font-weight-bold">{{title}}</span>
            </v-container>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex v-if="lastChange && lastChange.author && lastChange.timestamp">
            <v-container class="pr-0" text-xs-right>
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
            <count-button :count="numElementAttributes" :count-all="numSchemaAttributes" icon="list" text="Attribute" :to="'/editor/'+id"></count-button>
            <count-button :count="numChildren" icon="format_align_right" text="Unterelemente" :to="'/browser/'+id"></count-button>
            <create-menu class="hidden-xs-only"></create-menu>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex shrink>
            <count-button :count="numHistory" icon="history" text="Änderungen" right :to="'/history/'+id"></count-button>
            <count-button :count="numLinks" icon="link" text="Links" right :to="'/links/'+id"></count-button>
            <create-menu class="hidden-sm-and-up"></create-menu>
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
import CreateMenu from "~/components/ElementHeader/CreateMenu.vue";
import { VExpansionPanel } from "vuetify/lib";

export default Vue.extend({
  props: {
    visible: { type: Boolean },
    value: { type: Object }
  },
  components: {
    CountButton,
    CreateMenu
  },
  methods: {
    changeExpand(values: boolean[]) {
      this.$emit("input", values[0]);
    }
  },
  data() {
    return {};
  },
  mounted() {
    //TODO: Remove Fix when vuetifyjs/vuetify#5795 is fixed
    //Fix for #22
    try {
      const panels = this.$refs["panels"] as VExpansionPanel;
      if (this.visible && panels && panels.$el.clientHeight < 100) {
        panels.updateFromValue([]);
        this.$nextTick(() => {
          panels.updateFromValue([this.visible]);
        });
      }
    } catch (e) {}
  },
  computed: {
    ...activeElement.mapGetters({
      breadcrumb: "breadcrumb",
      element: "item",
      links: "links",
      history: "history",
      children: "children",
      schema: "schema"
    }),
    data(): Object {
      return this.value || (this.element && this.element.data);
    },
    showHeader(): boolean[] {
      return [this.visible];
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
    id(): string {
      return this.element ? this.element["id"] : "";
    },
    title(): string {
      return this.element ? this.element.title : "test";
    },
    numElementAttributes(): number {
      return this.element ? Object.keys(this.data).length : 0;
    },
    numSchemaAttributes(): number {
      return this.schema
        ? Object.keys(this.schema!.properties || {}).length
        : 0;
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
      if (this.history && this.history.length > 0) {
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
      padding: 0px 10px 0 10px;

      >>> .v-expansion-panel__header {
        padding: 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);

        .expansionHeader {
        }
      }
    }
  }
}
</style>
