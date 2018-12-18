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
      <v-dialog v-model="showDeleteDialog" max-width="600">
        <v-card>
          <v-card-text>
            Soll das Element
            <span class="font-weight-bold">{{formModel.data["$veo.title"]}}</span>
            zusammen mit
            <span class="font-italic">{{numLinks}} Verknüpfung{{numLinks==1?'':'en'}}</span> und
            <span class="font-italic">{{numChildren}} Unterelement{{numChildren==1?'':'en'}}</span>
            gelöscht werden?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click.native="showDeleteDialog = false">Abbrechen</v-btn>
            <v-btn color="primary" flat @click.native="showDeleteDialog = false; deleteElement()">Löschen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn flat color="primary" @click="showDeleteDialog = true">Löschen</v-btn>
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
      showDeleteDialog: false,
      headerOpen: true,
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
      links: "links",
      children: "children"
    }),
    numLinks(): number {
      return this.links ? this.links.length : 0;
    },
    numChildren(): number {
      return this.children ? this.children.length : 0;
    }
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
    ...elementsStore.mapActions({
      removeItems: "removeItems"
    }),
    onBreadcrumbChange(item: string) {},
    async save() {
      const id = await this.saveForm(this.form);
      if (id != this.$route.params.id) {
        this.$router.push("/editor/" + id);
      }
    },
    async deleteElement() {
      const id = this.formModel && this.formModel.id;
      const parent =
        this.formModel && this.formModel.parent ? this.formModel.parent : "";

      if (id) {
        await this.removeItems([id]);
        this.$router.push("/editor/" + parent);
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
