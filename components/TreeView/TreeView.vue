<template>
  <v-list class="pa-0 tree-view-list" fill-height v-resize="onResize">
    <virtual-list :size="48" :style="{maxHeight: maxHeight+'px'}" :remain="remain">
      <slot></slot>
    </virtual-list>
  </v-list>
</template>

<script lang="ts">
import Vue from "vue";
import virtualList from "vue-virtual-scroll-list";
export default Vue.extend({
  components: {
    virtualList
  },
  data() {
    return {
      remain: 10,
      size: 48
    };
  },
  props: {
    maxHeight: Number
  },
  methods: {
    onResize() {
      this.remain = Math.ceil(this.$el.clientHeight / 48) * 2;
    }
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

