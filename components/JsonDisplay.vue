<template>
    <dl>
        <template v-for="key, index in allKeys">
            <dt :class="changeTypes[index]">{{key}}</dt>
            <dd :class="changeTypes[index]">{{getValue(key, index)}}</dd>
        </template>
    </dl>

</template>
<script lang="ts">
import Vue from "vue";
import { union } from "lodash";

export default Vue.extend({
  props: {
    value: { type: Object },
    previousValue: { type: Object }
  },
  computed: {
    previousKeys: function() {
      return this.previousValue !== undefined
        ? Object.keys(this.previousValue)
        : [];
    },
    keys: function() {
      return this.value !== undefined ? Object.keys(this.value) : [];
    },
    allKeys: function() {
      return union(this.keys, this.previousKeys).sort();
    },
    changeTypes: function() {
      const { previousValue, previousKeys, value, keys } = this;
      const result = this.allKeys.map(function(key, index) {
        if (previousValue === undefined) {
          return "new";
        }

        if (previousKeys.indexOf(key) !== -1) {
          if (keys.indexOf(key) === -1) {
            return "removed";
          } else if (previousValue[key] == value[key]) {
            return "unchanged";
          } else {
            return "changed";
          }
        } else {
          return "added";
        }
      });
      console.log("Result: ", result);
      return result;
    }
  },
  methods: {
    getValue: function(key: string, index: number) {
      const { changeTypes, value, previousValue } = this;
      const changeType = changeTypes[index];
      if (changeType == "changed") {
        return `${previousValue[key]} → ${value[key]}`;
      } else {
        return value[key];
      }
    }
  }
});
</script>

<style lang="stylus" scoped>
dl {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    width: 800px;
    overflow: visible;

    > dt {
        flex: 0 0 15%;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: bold;
    }

    > dd {
        flex: 0 0 85%;
        margin-left: auto;
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
    }
}

.added {
    color: green;
}

.changed {
    color: #c0c000;
}

.removed {
    color: red;
    text-decoration: line-through;
}
</style>