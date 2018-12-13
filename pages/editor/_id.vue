<template>
  <v-layout class="ml-3 mr-3" fill-height column>
    <element-header v-model="headerOpen"></element-header>
    <veo-form slot="content" :model="formModel.data" @input="form = $event" :schema="formSchema" style="background-color: white; margin: 10px;"></veo-form>
    <v-flex>
      <v-btn flat to="/elements">Abbrechen</v-btn>
      <v-btn color="primary" flat @click.native="save()">Speichern</v-btn>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { VeoItem } from "~/types/api";
import { Element } from "~/types/app";
import VeoForm from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";
import { helpers as elementsStore } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";

export default Vue.extend({
  components: {
    ElementHeader,
    VeoForm
  },
  data() {
    return {
      headerOpen: true,
      groups: ["IT Baseline-Catalog", "BSI Model"],
      form: {} as VeoItem
    };
  },
  computed: {
    ...elementsStore.mapGetters({
      elements: "items"
    }),
    ...activeElement.mapGetters({
      formModel: "item",
      formSchema: "schema",
      links: "links"
    })
  },
  created() {
    if (this.formModel) {
      this.form = this.formModel.data;
    }
  },
  methods: {
    ...activeElement.mapActions({
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
    if (id) {
      if (id == "new") {
        //await formStore.dispatch("create", { type, parent });
      } else {
        await activeElement.dispatch("fetchItem", { id });
        //await formStore.dispatch("load", { id });
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
