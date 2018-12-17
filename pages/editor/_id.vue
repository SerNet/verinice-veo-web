<template>
  <!-- <v-layout class="ml-3 mr-3" fill-height column>
    <element-header v-model="headerOpen"></element-header>
    <v-flex ma-3 xs12>
      <v-alert outline :value="true" type="error" v-if="!formSchema">
        Das zugehörige Schema
        <q>{{schemaName}}</q> konnte nicht abgerufen werden. Die Daten können daher nicht bearbeitet werden.
      </v-alert>
    </v-flex>
    <v-flex grow xs12>
      <veo-form slot="content" :model="formModel.data" @input="form = $event" :schema="formSchema" style="background-color: white; margin: 10px;"></veo-form>
    </v-flex>
    <v-spacer></v-spacer>
    <v-flex xs12 shrink>
      <v-toolbar flat>
        <v-btn color="primary" flat @click.native="save()">Speichern</v-btn>
      </v-toolbar>
    </v-flex>
  </v-layout>-->
  <v-layout column fill-height>
    <v-flex d-flex grow>
      <element-header v-model="headerOpen"></element-header>
    </v-flex>
    <v-flex fill-height d-flex xs12 style="overflow: auto;">
      <veo-form slot="content" :model="formModel.data" @input="form = $event" :schema="formSchema"></veo-form>
    </v-flex>
    <v-flex d-flex style="min-height: 64px;">
      <v-toolbar dense class="bottom-toolbar px-3" color="transparent" flat>
        <v-spacer></v-spacer>
        <v-btn flat @click.native="save()">Löschen</v-btn>
        <v-btn color="primary" @click.native="save()">Speichern</v-btn>
      </v-toolbar>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { ApiItem } from "~/types/api";
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
