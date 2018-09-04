<template>
  <v-layout class="form-panels" style="overflow: auto !important;" column>
    <v-expansion-panel :value="[true]" class="pa-3" :expand="false">

      <!-- Editor -->
      <v-expansion-panel-content class="grey lighten-3 elevation-1">
        <div slot="header">
          <span style="margin-left: 6px;">Basic</span>
          <v-menu style="float:right;" @click.native.stop>
            <v-btn slot="activator" icon style="margin: 0; height: 24px; width: 24px;">
              <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile>
                <v-list-tile-title>Test 1</v-list-tile-title>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-title>Test 2</v-list-tile-title>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-title>Test 3</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
        <v-card>
          <v-card-text class="white lighten-3">
            <v-form v-if="schema && schema.properties">
              <abstract-field v-for="(property, key) in schema.properties" :key="key" :name="key" :schema="property" :required="schema.required.includes(key)" :value="model[key]" />
            </v-form>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>

      <!-- Links -->
      <v-expansion-panel-content class="grey lighten-3 elevation-1">
        <div slot="header">
          <span style="margin-left: 6px;">Links</span>
          <v-menu style="float:right;" @click.native.stop>
            <v-btn slot="activator" icon style="margin: 0; height: 24px; width: 24px;">
              <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile>
                <v-list-tile-title>Test 1</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
        <v-card>
          <v-card-text class="white lighten-3">

            <v-data-table :headers="headers" :items="links" v-model="selected" item-key="name" select-all>
              <template slot="items" slot-scope="link">
                <td>
                  <v-checkbox v-model="link.selected" primary hide-details></v-checkbox>
                </td>
                <td>{{ link.item.from }}</td>
                <td>{{ link.item.desc }}</td>
                <td>{{ link.item.to }}</td>
              </template>
            </v-data-table>

          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import AbstractField from "~/components/Form/AbstractField.vue";

export default Vue.extend({
  components: {
    AbstractField
  },
  data() {
    return {
      current: {
        chapter: "TEST"
      },
      previewNav: { open: false },
      selected: [],
      headers: [
        {
          text: "Start-Element",
          value: "from"
        },
        {
          text: "Beziehung",
          value: "desc"
        },
        {
          text: "Ziel-Element",
          value: "to"
        }
      ],
      links: [
        {
          value: false,
          from: "Router",
          to: "Netzwerk",
          desc: "befindet sich in"
        },
        {
          value: false,
          from: "Server",
          to: "Serverschrank",
          desc: "in"
        },
        {
          value: false,
          from: "Schlüssel",
          to: "Schloss",
          desc: "passt in"
        }
      ]
    };
  },
  props: {
    model: {
      type: Object
    },
    schema: {
      type: Object
    }
  }
});
</script>
<style lang="stylus">
.form-panels {
  ul.v-expansion-panel li {
    max-width: 100% !important;

    .v-expansion-panel__header {
      padding: 12px;

      div:not(.v-expansion-panel__header__icon) {
        order: 2;
      }

      .v-expansion-panel__header__icon {
        order: 1;
      }
    }
  }
}

.breadcrumb-toolbar {
  z-index: 1;

  .breadcrumbs {
    flex-wrap: nowrap;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0px;
    bottom: 0;

    .breadcrumb-item {
      min-width: 50px;

      a {
        display: block !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 12px 8px;
      }
    }

    li.breadcrumbs__divider {
      padding: 0 2px;
    }
  }
}
</style>
