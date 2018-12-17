<template>
  <v-flex class="countButton" shrink>
    <div>
      <span>{{count}}{{countAll?'/'+countAll:''}}</span>
    </div>
    <v-btn flat class="ma-0" :to="to">
      <v-icon>{{icon}}</v-icon>
      <span>{{text}}</span>
    </v-btn>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    count: { type: Number, default: 0 },
    countAll: { type: Number },
    icon: String,
    text: String,
    to: String
  },
  methods: {}
});
</script>

<style lang="stylus" scoped>
.countButton {
  margin: 5px;

  &:last-child {
    margin: 0;
  }

  display: inline-block;
  border-radius: 2px;
  border: 1px solid #ccc;
  vertical-align: top;
  overflow: hidden;
  white-space: nowrap;

  > div {
    border-right: 1px solid #ccc;
    background-color: #f5f5f5;
    display: block;
    float: left;
    padding: 8px 15px;
    line-height: 18px;

    > span {
      margin: auto;
    }
  }

  >.v-btn {
    border-radius: 0 2px 2px 0;
    border: 0;
    height: 34px;
    padding: 0 10px;
    text-transform: none;
    font-weight: normal;

    .v-icon {
      margin-right: 5px;
      color: #888;
    }
  }
}
</style>
