<template>
  <v-layout fill-height column>
    <veo-breadcrumb :items="breadcrumb" @change="onBreadcrumbChange">
      <template slot-scope="props">{{props.title}}</template>
    </veo-breadcrumb>
    <v-widget class="form-widget">
      <veo-form slot="content" :model="formModel" @input="form = $event" :schema="formSchema"></veo-form>
      <template slot="actions">
        <v-btn flat to="/elements">Abbrechen</v-btn>
        <v-btn color="primary darken-1" flat @click.native="save()">Speichern</v-btn>
      </template>
    </v-widget>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import VeoForm from "~/components/Form/Form.vue";
import vWidget from "~/components/Widget.vue";
import TreeNav from "~/components/TreeNav/TreeNav.vue";

import VeoBreadcrumb from "~/components/VeoBreadcrumb.vue";

import { helpers as treeStore } from "~/store/modules/tree";
import { helpers as formStore } from "~/store/modules/form";

export default Vue.extend({
  components: {
    TreeNav,
    VeoBreadcrumb,
    vWidget,
    VeoForm
  },
  data() {
    return {
      groups: ["IT Baseline-Catalog", "BSI Model"],
      form: {}
    };
  },
  computed: {
    ...treeStore.mapState({ treeItems: "items" }),
    ...formStore.mapState({
      formModel: "model",
      formSchema: "schema",
      breadcrumb: "breadcrumb"
    })
  },
  created() {
    this.form = this.formModel;
  },
  methods: {
    ...formStore.mapActions({
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
.tree-nav {
  position: fixed;
  top: 64px;
  left: 80px;
  bottom: 0;
  width: 300px;
}

.form-widget {
  position: absolute;
  bottom: 1px;
  right: 0;
  left: 300px;
  top: 48px;
}
</style>
