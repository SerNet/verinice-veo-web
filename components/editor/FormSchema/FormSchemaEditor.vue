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
      <FseGenerator :schema="objectSchema" :value="value.content" />
      <v-speed-dial
        v-model="fab"
        bottom
        absolute
        right
        direction="top"
        open-on-hover
        transition="scale-transition"
        fixed
        style="right: 50%;"
      >
        <template #activator>
          <v-btn v-model="fab" color="primary" dark small fab>
            <v-icon v-if="fab">
              mdi-close
            </v-icon>
            <v-icon v-else>
              mdi-plus
            </v-icon>
          </v-btn>
        </template>
        <v-btn fab dark x-small color="light-blue darken-2">
          <v-icon>mdi-format-text</v-icon>
        </v-btn>
        <v-btn fab dark x-small color="deep-purple darken-2">
          <v-icon>mdi-form-textbox-password</v-icon>
        </v-btn>
        <v-btn fab dark x-small color="green darken-3">
          <v-icon>mdi-form-select</v-icon>
        </v-btn>
        <v-btn fab dark x-small color="blue-grey darken-2">
          <v-icon>mdi-book-open-page-variant</v-icon>
        </v-btn>
      </v-speed-dial>
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
      fab: false
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
  border: 1px solid black !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-string {
  border: 1px solid $color-string !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-boolean {
  border: 1px solid $color-boolean !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-number {
  border: 1px solid $color-number !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-integer {
  border: 1px solid $color-integer !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-object {
  border: 1px solid $color-object !important;
}
.veo-editor-body ::v-deep .v-card.fse-os-array {
  border: 1px solid $color-array !important;
}
// TODO: Type: "enum" does not exist in JsonSchema Standard
.veo-editor-body ::v-deep .v-card.fse-os-enum {
  border: 1px solid $color-enum !important;
}
// TODO: Type: "enum" does not exist in JsonSchema Standard
.veo-editor-body ::v-deep .v-card.fse-os-null {
  border: 1px solid $color-null !important;
}
</style>
