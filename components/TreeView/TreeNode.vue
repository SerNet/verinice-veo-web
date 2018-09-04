<template>
  <v-list-tile class="tree-item" :style="{paddingLeft: level*20+'px'}" @click="()=>{}" :to="to">
    <v-list-tile-action class="small-action" :style="{visibility: hasChildren?'visible':'hidden'}">
      <v-btn icon @click.stop.prevent="$emit('expand')">
        <v-icon class="chevron" :class="[expanded?'open':'']">chevron_right</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-action class="small-action" @click.prevent>
      <v-checkbox class="checkbox" :indeterminate="checked === undefined" :value="checked" :input-value="checked" @change="$emit('check')"></v-checkbox>
    </v-list-tile-action>
    <v-list-tile-content @click="()=>{}">
      <v-list-tile-title>
        <slot></slot>
      </v-list-tile-title>
    </v-list-tile-content>
    <v-spacer></v-spacer>
    <v-list-tile-action style="min-width: 24px">
      <!-- click preventDefault: https://github.com/vuetifyjs/vuetify/issues/3333#issuecomment-389775441 -->
      <v-menu>
        <v-btn slot="activator" icon>
          <v-icon style="color: #aaa">more_vert</v-icon>
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
    </v-list-tile-action>
  </v-list-tile>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    checkable: { type: Boolean, default: false },
    checked: { type: Boolean, default: undefined },
    expanded: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    to: { type: String }
  }
});
</script>


<style lang="stylus" scoped>
.small-action {
  min-width: 30px;
}

.checkbox {
  zoom: 0.8;

  >>> .v-input__slot {
    margin-bottom: 0;
  }
}

.chevron.open {
  transform: rotate(90deg);
}
</style>

