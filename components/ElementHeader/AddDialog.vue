<template>
  <v-dialog :value="value" @input="$emit('input', $event)" max-width="600">
    <template slot="activator">
      <slot name="activator"></slot>
    </template>
    <v-form>
      <v-card>
        <v-card-text>
          <v-autocomplete
            :loading="loadingParents"
            label="Übergeordnetes Element"
            :value="parent"
            @input="onChangeParent"
            :search-input.sync="parentSearch"
            :items="parents"
            :item-text="[parentText]"
            :item-value="[parentValue]"
            clearable
          ></v-autocomplete>
          <v-autocomplete :loading="loadingSchemas" label="Typ" @input="onChangeType" :items="types" :value="type" clearable></v-autocomplete>
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
import { helpers as elements } from "~/store/elements";
import { helpers as active } from "~/store/elements/active";
import { helpers as schemas } from "~/store/schemas";
import { AppElement } from "~/types/app";

export default Vue.extend({
  data() {
    return {
      selectedParent: "",
      selectedType: "",
      loadingParents: false,
      loadingSchemas: false,
      parentSearch: "",
      parents: [] as AppElement[]
    };
  },
  props: {
    value: Boolean,
    parent: String,
    type: String,
    valueComparator: Function,
    parentText: { type: String, default: "title" },
    parentValue: { type: String, default: "id" }
  },
  async mounted() {
    this.loadingSchemas = true;
    await this.fetchSchemas({});
    this.loadingSchemas = false;
    if (this.parent) {
      this.selectedParent = this.parent;
    }
    const p = this.queryParents();
    this.selectedParent = "";
    await p;
    this.selectedParent = this.selectedParent;
  },
  computed: {
    ...schemas.mapState({
      types: "items"
    }),
    ...elements.mapGetters({
      elements: "items"
    })
  },
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
    },
    parentSearch(v) {
      this.queryParents();
    }
  },
  methods: {
    ...elements.mapActions({ searchItems: "searchItems" }),
    ...schemas.mapActions({ fetchSchemas: "fetchSchemas" }),
    async queryParents() {
      this.loadingParents = true;
      this.parents = (this.selectedParent && this.elements[this.selectedParent]
        ? [this.elements[this.selectedParent]]
        : []
      ).concat(
        await this.searchItems({
          q: this.parentSearch
        })
      );
      this.loadingParents = false;
    },
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

