<template>
  <v-layout justify-start fill-height column>
    <v-flex shrink>
      <element-header :value="form" :visible="headerOpen"></element-header>
    </v-flex>
    <v-flex>
      <veo-form slot="content" :model="formModel.data" @input="onFormChange" :schema="formSchema"></veo-form>
    </v-flex>
    <v-spacer></v-spacer>
    <footer-toolbar>
      <v-btn flat color="primary">Löschen</v-btn>
      <v-spacer></v-spacer>
      <v-btn flat>Zurücksetzen</v-btn>
      <v-btn :disabled="!formSchema || !formModel || !formModel.data" color="primary" @click.native="save()">Speichern</v-btn>
    </footer-toolbar>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { ApiItem } from "~/types/api";
import VeoForm from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";
import FooterToolbar from "~/components/Editor/FooterToolbar.vue";
import { helpers as elementsStore } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";

export default Vue.extend({
  components: {
    ElementHeader,
    VeoForm,
    FooterToolbar
  },
  data() {
    return {
      headerOpen: true,
      groups: ["IT Baseline-Catalog", "BSI Model"],
      form: {} as ApiItem
    };
  },
  computed: {
    ...elementsStore.mapGetters({
      elements: "items"
    }),
    ...activeElement.mapGetters({
      schemaName: "schemaName",
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
    },
    onFormChange(form: Object) {
      const frm: any = {};
      for (const key in form) {
        if (form[key] !== null) {
          frm[key] = form[key];
        }
      }
      this.form = frm;
    }
  },
  async asyncData({ store, query: { type, parent }, params: { id } }) {
    const errors: string[] = [];
    if (id) {
      if (id == "new") {
        //await formStore.dispatch("create", { type, parent });
      } else {
        await activeElement.dispatch("fetchItem", { id });
        try {
          if (activeElement.getters.schemaName) {
            await activeElement.dispatch("fetchSchema", {
              name: activeElement.getters.schemaName
            });
          }
        } catch (e) {
          if (e.status != 404) {
            throw e;
          }
        }
        //await formStore.dispatch("load", { id });
      }
    }
    return { errors };
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

.bottom-toolbar {
  >>> .v-toolbar__content {
    padding: 0;
  }
}
</style>
