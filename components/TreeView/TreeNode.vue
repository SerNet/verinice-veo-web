<template>
  <v-list-tile class="tree-item" :style="{paddingLeft: level*20+'px'}" @click="()=>{}" :to="to">
    <v-list-tile-action class="small-action">
      <v-checkbox class="checkbox" :indeterminate="checked === undefined" :value="checked" :input-value="checked" @change="$emit('check')"></v-checkbox>
    </v-list-tile-action>
    <v-list-tile-action class="small-action" :style="{visibility: hasChildren?'visible':'hidden'}">
      <v-btn icon @click="$emit('expand')">
        <v-icon class="chevron" :class="[expanded?'open':'']">chevron_right</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-content @click="()=>{}">
      <v-list-tile-title>
        <slot></slot>
      </v-list-tile-title>
    </v-list-tile-content>
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
}

.chevron.open {
  transform: rotate(90deg);
}
</style>

