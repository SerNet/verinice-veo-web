<template>
  <v-layout class="ml-3 mr-3" fill-height column>
    <element-header
      :id="$route.params.id"
      :title="title"
      :breadcrumb="breadcrumb"
      v-model="headerOpen"
      :num-attrbutes="numAttributes"
      :num-children="numChildren"
      :num-links="numLinks"
    ></element-header>
    <veo-form slot="content" :model="formModel" @input="form = $event" :schema="formSchema" style="background-color: white; margin: 10px;"></veo-form>
    <template slot="actions">
      <v-btn flat to="/elements">Abbrechen</v-btn>
      <v-btn color="primary darken-1" flat @click.native="save()">Speichern</v-btn>
    </template>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import VeoForm from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";
import { helpers as formHelpers } from "~/store/form";
import { helpers as elementsHelpers } from "~/store/elements";

export default Vue.extend({
  components: {
    ElementHeader,
    VeoForm
  },
  data() {
    return {
      headerOpen: true,
      groups: ["IT Baseline-Catalog", "BSI Model"],
      form: {}
    };
  },
  computed: {
    ...elementsHelpers.mapState({
      elements: "items"
    }),
    ...elementsHelpers.mapGetters({
      childrenById: "childrenById",
      breadcrumbById: "breadcrumbById"
    }),
    ...formHelpers.mapState({
      formModel: "model",
      formSchema: "schema",
      links: "links"
    }),
    breadcrumb(): any[] {
      const id = this.$route.params.id;
      const items = this.breadcrumbById(id) || [];
      return items.map(id => this.elements[id]);
    },
    title() {
      if (this.formModel && this.formModel["$veo.title"]) {
        return this.formModel["$veo.title"];
      }
      return null;
    },
    numAttributes() {
      if (this.formModel) {
        return Object.keys(this.formModel).length;
      }
      return 0;
    },
    numChildren(): number {
      const children = this.childrenById(this.$route.params.id);
      if (children) {
        return children.length;
      }
      return 0;
    },
    numLinks(): number {
      return this.links && this.links.length;
    }
  },
  created() {
    this.form = this.formModel;
  },
  methods: {
    ...formHelpers.mapActions({
      saveForm: "save"
    }),
    onBreadcrumbChange(item: string) {},
    async save() {
      const id = await this.saveForm(this.form);
      if (id != this.$route.params.id) {
        this.$router.push("/elements/" + id);
      }
    }
  },
  async fetch({ store, query: { type, parent }, params: { id } }) {
    //await store.dispatch("tree/getItems", params);
    if (id) {
      if (id == "new") {
        await store.dispatch("form/create", { type, parent });
      } else {
        await store.dispatch("form/load", { id });
      }
    }
  },
  validate({ store, params }) {
    return String(params.id || "").indexOf(".") === -1;
  }
});
</script>

<style lang="stylus" scoped>
.breadcrumb {
  position: absolute;
  right: 0;
  left: 0;
  top: 0px;
}
</style>
