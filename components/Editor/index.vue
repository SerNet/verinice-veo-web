<template>
  <v-card flat style="border: 1px solid #CCC; margin: 15px">
    <v-card-title>
      <h2 class="title">Editor</h2>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-form>
        <v-layout row wrap class="form-panels">
          <v-flex xs12 v-if="schema===null">
            <v-alert outline :value="true" type="error">
              Das zugehörige Schema
              <q>{{model["$veo.type"]}}</q> konnte nicht abgerufen werden. Die Daten können daher nicht bearbeitet werden.
            </v-alert>
          </v-flex>
          <v-flex class="pt-2" xs12 v-for="property in properties" :key="property.key">
            <abstract-field
              :name="property.key"
              :schema="property"
              :disabled="!schema"
              :required="required.includes(property.key)"
              @input="onFieldChange(property, $event)"
              :value="model[property.key]"
            />
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import AbstractField from "~/components/Editor/AbstractField.vue";
import { JSONSchema6, JSONSchema6TypeName } from "json-schema";

export type JSONSchemaProperty = JSONSchema6 & { key: string };

export default Vue.extend({
  components: {
    AbstractField
  },
  data() {
    return {
      hiddenKeys: ["id", "parent", "type"],
      current: {
        chapter: "TEST"
      },
      previewNav: { open: false },
      selected: [],
      headers: [
        {
          text: "Start-Element",
          value: "from"
        },
        {
          text: "Beziehung",
          value: "desc"
        },
        {
          text: "Ziel-Element",
          value: "to"
        }
      ],
      links: [
        {
          value: false,
          from: "Router",
          to: "Netzwerk",
          desc: "befindet sich in"
        },
        {
          value: false,
          from: "Server",
          to: "Serverschrank",
          desc: "in"
        },
        {
          value: false,
          from: "Schlüssel",
          to: "Schloss",
          desc: "passt in"
        }
      ]
    };
  },
  computed: {
    id() {},
    parent() {},
    type() {},
    properties(): Array<JSONSchemaProperty> {
      const properties: { [k: string]: JSONSchema6 } =
        this.schema && this.schema.properties;
      if (properties) {
        const filterKeys = this.hiddenKeys;
        return (
          Object.keys(properties || {})
            //.filter(key => filterKeys.indexOf(key) === -1)
            .map(key => ({
              ...properties[key],
              key
            }))
        );
      } else {
        return (
          this.model &&
          Object.keys(this.model)
            .sort()
            .map(
              key =>
                ({
                  key,
                  type: "string",
                  title: String(key).replace(/(?:^|\s+)\w/, m =>
                    m.toUpperCase()
                  )
                } as JSONSchemaProperty)
            )
        );
      }
    },
    required(): string[] {
      if (this.schema) {
        return this.schema.required;
      } else {
        return Object.keys(this.model);
      }
    }
  },
  methods: {
    onFieldChange(property: JSONSchemaProperty, value: any) {
      this.$emit("input", { ...this.model, [property.key]: value });
    }
  },
  props: {
    model: {
      type: Object
    },
    schema: {
      type: Object
    }
  }
});
</script>
<style lang="stylus">
.form-panels {
  ul.v-expansion-panel li {
    max-width: 100% !important;

    .v-expansion-panel__header {
      padding: 12px;

      div:not(.v-expansion-panel__header__icon) {
        order: 2;
      }

      .v-expansion-panel__header__icon {
        order: 1;
      }
    }
  }
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
