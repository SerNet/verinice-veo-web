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

        <div
          v-for="element in createElementActions"
          :key="element.name"
          class="fse-create-element"
        >
          <v-btn fab x-small>
            <v-icon>{{ element.icon }}</v-icon>
          </v-btn>
          <span class="fse-create-element-caption">{{ element.name }}</span>
        </div>
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
      fab: false,
      createElementActions: [
        { name: 'Label', icon: 'mdi-format-text' },
        { name: 'Control', icon: 'mdi-form-textbox-password' },
        { name: 'Layout', icon: 'mdi-form-select' },
        { name: 'Page', icon: 'mdi-book-open-page-variant' }
      ]
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

.fse-create-element {
  align-items: center;
  display: flex;
  position: relative;

  .fse-create-element-caption {
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.87);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 6px 12px;
    position: absolute;
    right: 52px; /* 40px is the width of the button next to it, 3*4px the offset. */
    white-space: nowrap;
  }
}
</style>
