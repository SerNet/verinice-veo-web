<template>
  <v-list-tile class="tree-item" :style="{paddingLeft: _indent}" @click="()=>{}">
    <v-list-tile-action v-if="checkable" class="small-action">
      <v-checkbox class="checkbox" :indeterminate="checked === undefined" v-model="checked"></v-checkbox>
    </v-list-tile-action>
    <v-list-tile-action class="small-action" :style="{visibility: hasChildren?'visible':'hidden'}">
      <v-btn icon @click="$emit('toggle')">
        <v-icon class="chevron" :class="[open?'open':'']">chevron_right</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-content @click="()=>{}">
      <v-list-tile-title>{{title}}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";

const store = namespace("tree");

@Component({
  components: {}
})
export default class TreeNode extends Vue {
  @Prop({ type: Boolean, default: false })
  checkable: Boolean;
  @Prop({ type: Boolean, default: undefined })
  checked?: Boolean;

  @Prop({ type: Number, default: 20 })
  indent: number = 20;
  @Prop({ type: Number, default: 0 })
  level: number;
  @Prop({ type: Boolean, default: false })
  open: Boolean;

  @Prop({ type: Array, default: () => [] })
  children: any[];

  @Prop({ type: String, default: "" })
  title: String;

  get _indent() {
    return this.level * this.indent + "px";
  }

  get hasChildren() {
    return this.children && this.children.length;
  }
}
</script>


<style lang="stylus" scoped>
.small-action {
  min-width: 30px;
}

.checkbox {
  margin-top: 20px;
  zoom: 0.8;
}

.chevron.open {
  transform: rotate(90deg);
}
</style>

