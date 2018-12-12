<template>
  <v-dialog :value="value" @input="$emit('input', $event)" max-width="600">
    <template slot="activator">
      <slot name="activator"></slot>
    </template>
    <v-form>
      <v-card>
        <v-card-text>
          <v-autocomplete label="Übergeordnetes Element" :value="parent" @input="onChangeParent" :items="parents" :item-text="[parentText]" :item-value="[parentValue]" clearable>
            <template slot="item" slot-scope="scope">
              <slot name="parent-item" v-bind="scope"></slot>
            </template>
          </v-autocomplete>
          <v-autocomplete label="Typ" @input="onChangeType" :items="types" :value="type" clearable></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="$emit('input', false)">Abbrechen</v-btn>
          <v-btn color="primary" flat @click.native="save()">Anlegen</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      selectedParent: "",
      selectedType: ""
    };
  },
  props: {
    value: Boolean,
    parent: String,
    parents: Array as () => any[],
    types: Array as () => any[],
    type: String,
    valueComparator: Function,
    parentText: { type: String, default: "text" },
    parentValue: { type: String, default: "value" }
  },
  computed: {},
  watch: {
    parent: {
      handler(val) {
        this.selectedParent = val;
      },
      immediate: true
    },
    type: {
      handler(val) {
        this.selectedType = val;
      },
      immediate: true
    }
  },
  methods: {
    onChangeType(value: string) {
      this.selectedType = value;
      this.$emit("update:type", value);
    },
    onChangeParent(value: string) {
      this.selectedParent = value;
      this.$emit("update:parent", value);
    },
    save() {
      this.$emit("input", false);
      this.$emit("save", {
        type: this.selectedType,
        parent: this.selectedParent
      });
    }
  }
});
</script>

<style lang="stylus" scoped>
</style>

