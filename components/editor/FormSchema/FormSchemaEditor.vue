<template>
  <div>
    <div class="px-5 py-4 veo-editor-header">
      <v-expansion-panels accordion>
        <v-expansion-panel>
          <v-expansion-panel-header class="pa-2">
            Unused Aspects
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            ___
            <br />
            ___
            <br />
            ___
            <br />
            ___
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="pa-2">
            Unused Links
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            ___
            <br />
            ___
            <br />
            ___
            <br />
            ___
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <div class="veo-editor-body" style="height: 5000px;">
      <v-card
        v-for="(el, i) in list"
        :key="i"
        width="300"
        outlined
        color="grey lighten-4"
        class="ma-2"
      >
        <v-row no-gutters>
          <v-col cols="auto">
            <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
          </v-col>
          <v-col cols="auto">
            <div style="max-width: 220px;">
              <div class="text-caption text-truncate">{{ el }}</div>
              <div class="text-caption text-truncate">
                Control (InputText)
              </div>
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="text-right">
            <v-btn icon>
              <v-icon dense small class="pa-2">mdi-pencil</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-card
        min-width="300"
        min-height="100"
        outlined
        color="grey lighten-4"
        class="ma-2"
      >
        <v-row no-gutters>
          <v-col>
            <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="text-right">
            <v-btn icon>
              <v-icon dense small class="pa-2">mdi-pencil</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <div class="d-flex flex-column">
              <v-card
                v-for="(el, i) in list"
                :key="i"
                width="300"
                outlined
                color="grey lighten-4"
                class="ma-2"
              >
                <v-row no-gutters>
                  <v-col>
                    <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
                    {{ el }}
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col class="text-right">
                    <v-btn icon>
                      <v-icon dense small class="pa-2">mdi-pencil</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <v-card
        min-width="300"
        min-height="100"
        outlined
        color="grey lighten-4"
        class="ma-2"
      >
        <v-row no-gutters>
          <v-col>
            <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="text-right">
            <v-btn icon>
              <v-icon dense small class="pa-2">mdi-pencil</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <div class="d-flex flex-row">
              <v-card
                v-for="(el, i) in list"
                :key="i"
                width="300"
                outlined
                color="grey lighten-4"
                class="ma-2"
              >
                <v-row no-gutters>
                  <v-col>
                    <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
                    {{ el }}
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col class="text-right">
                    <v-btn icon>
                      <v-icon dense small class="pa-2">mdi-pencil</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <FseGenerator
        :schema="objectSchema"
        :value="value.content"
        @input="$emit('input', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Draggable from 'vuedraggable'
// import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import FseGenerator from './Generator/FseGenerator.vue'

export default Vue.extend({
  name: 'FormSchemaEditor',
  components: {
    Draggable,
    FseGenerator
  },
  props: {
    objectSchema: Object,
    value: Object
  },
  data() {
    return {
      list: ['Title 1', 'Title 2', 'Title 3'],
      list2: []
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-editor-header {
  background-color: white;
  border-bottom: 2px solid $grey;
  position: sticky;
  top: 0;
  z-index: 2;
  max-height: 200px;
  overflow: auto;
}

.veo-editor-header ::v-deep .v-expansion-panel-header {
  min-height: auto;
}
.veo-editor-header
  ::v-deep
  .v-expansion-panel--active
  > .v-expansion-panel-header {
  min-height: auto;
}

.veo-editor-body ::v-deep .v-card {
  border: 1px solid $grey-darken-2 !important;
}
</style>
