<template>
  <v-layout justify-start fill-height column>
    <v-flex shrink>
      <element-header :value="form" :visible="headerOpen"></element-header>
    </v-flex>
    <v-flex>
      <veo-editor slot="content" :model="formModelData" @input="onFormChange" :schema="formSchema"></veo-editor>
    </v-flex>
    <v-spacer></v-spacer>
    <footer-toolbar>
      <v-dialog v-model="showDeleteDialog" max-width="600">
        <v-card>
          <v-card-text>
            Soll das Element
            <span class="font-weight-bold">{{formModelTitle}}</span>
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
      <v-btn :disabled="!formSchema || !formModel || !formModelData" color="primary" @click.native="save()">Speichern</v-btn>
    </footer-toolbar>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState,
  mapGetters,
  mapActions,
  useStore
} from "vuex-typesafe-class";
import { isNull, omitBy } from "lodash";
import {
  ID_FIELD,
  TITLE_FIELD,
  PARENT_FIELD,
  ApiItemFields
} from "~/types/api";

import VeoEditor, {
  Events as EditorEvents
} from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";
import FooterToolbar from "~/components/Editor/FooterToolbar.vue";

import elementsStore from "~/store/elements";
import activeElementStore from "~/store/elements/active";

import { ApiItem } from "~/types/api";
import { AppElement } from "~/types/app";

export default Vue.extend({
  components: {
    ElementHeader,
    VeoEditor,
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
    ...mapGetters(elementsStore, {
      elements: "items"
    }),
    ...mapGetters(activeElementStore, {
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
    },
    formModelData(): ApiItem | undefined {
      const fm = this.formModel;
      return fm && fm.data;
    },
    formModelTitle(): string | undefined {
      return this.formModelData && this.formModelData.title;
    }
  },
  created() {
    if (this.formModel) {
      this.form = this.formModel.data;
    }
  },
  methods: {
    ...mapActions(activeElementStore, {
      saveForm: "save"
    }),
    ...mapActions(elementsStore, {
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
    onFormChange(form: ApiItem) {
      this.form = omitBy(form, isNull) as ApiItem;
    }
  },
  async asyncData({ store, query, params }) {
    const $activeElement = useStore(activeElementStore, store);
    const errors: string[] = [];
    if (params.id) {
      if (params.id == "new") {
        //await formStore.dispatch("create", { type, parent });
      } else {
        await $activeElement.fetchItem({ id: params.id });
        try {
          if ($activeElement.schemaName) {
            await $activeElement.fetchSchema({
              name: $activeElement.schemaName
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
