<template>
  <v-menu offset-y style="margin-top: 1px;">
    <add-dialog
      v-model="showAddDialog"
      @input="createElement"
      :parent="parent?parent:activeId"
      @update:parent="parent=$event"
      :type="type?type:activeType"
      @update:type="type=$event"
    ></add-dialog>
    <v-btn flat outline dark color="#CCC" slot="activator" class="ma-1 pa-0">
      <v-icon color="primary">add</v-icon>
      <v-icon color="primary">arrow_drop_down</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile @click="showAddDialog = true">
        <v-list-tile-title>Neues Unterelement</v-list-tile-title>
      </v-list-tile>
      <v-list-tile disabled>
        <v-list-tile-title>Neuer Link</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>
<script lang="ts">
import Vue from "vue";
import AddDialog from "~/components/ElementHeader/AddDialog.vue";
import { helpers as elements } from "~/store/elements";
import { helpers as active } from "~/store/elements/active";

export default Vue.extend({
  components: {
    AddDialog
  },
  computed: {
    ...active.mapGetters({
      activeItem: "item"
    }),
    activeId(): string {
      return (this.activeItem && this.activeItem.id) || "";
    },
    activeType(): string {
      return (this.activeItem && this.activeItem.type) || "";
    }
  },
  data() {
    return {
      showAddDialog: false,
      parent: "",
      type: ""
    };
  },
  methods: {
    ...elements.mapActions({
      createItem: "createItem"
    }),
    async createElement() {
      const parent = this.parent || this.activeId;
      const type = this.type || this.activeType;
      const id = await this.createItem({ parent, type });
      this.$router.push("/editor/" + id);
    }
  }
});
</script>

