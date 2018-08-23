<template>
  <component :is="fieldComponent" v-bind="fieldOptions" :label="name" :placeholder="schema.title" :value="value" />
</template>

<script lang="ts">
import Vue from "vue";
import { JSONSchema6, JSONSchema6TypeName } from "json-schema";

interface IComponentDeclaration {}

export const componentByType: {
  [k in JSONSchema6TypeName]?: IComponentDeclaration
} = {
  string: { id: "v-text-field" },
  number: { id: "v-text-field" },
  boolean: { id: "v-text-field" },
  array: { id: "v-text-field" }
};

export default Vue.extend({
  props: {
    name: { type: String },
    schema: { type: Object },
    required: { type: Boolean },
    value: {}
  },

  data() {
    return {
      fieldComponent: "v-text-field",
      fieldOptions: {} as any
    };
  },

  methods: {
    initComponent(schema: JSONSchema6) {
      switch (schema.type) {
        case "string":
          this.fieldComponent = "v-text-field";
          break;
        case "number":
          this.fieldComponent = "v-text-field";
          break;
      }
      if (schema.enum) {
        this.fieldComponent = "v-select";
        this.fieldOptions.items = schema.enum;
      }
    }
  },
  watch: {
    schema: {
      immediate: true,
      handler(schema) {
        this.initComponent(schema);
      }
    }
  }
});
</script>
<style lang="stylus">
.form-panels {
  ul.expansion-panel li {
    margin-top: 16px !important;
    max-width: 100% !important;

    .expansion-panel__header {
      padding: 12px;
    }
  }
}

.alert.basic {
  // color: $theme['secondary_text'];
  background-color: #EEE !important;
  border-color: #DDD !important;
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
