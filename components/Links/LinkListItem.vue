<template>
  <v-flex class="linkListItem" shrink>
    <v-divider v-if="index!=0" inset :key="index"></v-divider>
    <v-list-tile :key="link.title" avatar :to="to">
      <v-badge :color="inbound?'green':'blue'" right bottom overlap>
        <v-icon slot="badge" dark small>{{inbound?'arrow_forward':'arrow_back'}}</v-icon>
        <v-list-tile-avatar class="avatar-with-badge" color="grey">
          <span class="white--text headline">{{title.substr(0,1).toUpperCase()}}</span>
        </v-list-tile-avatar>
      </v-badge>
      <v-list-tile-content class="list-item-content">
        <v-list-tile-title>{{title}}</v-list-tile-title>
        <v-list-tile-sub-title>{{subtitle}}</v-list-tile-sub-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-menu offset-x offset-y v-model="showMenu">
          <v-btn slot="activator" icon ripple @click.prevent>
            <v-icon color="grey lighten-1">more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile>
              <v-list-tile-title @click="showDialog = true">Link löschen</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-list-tile-action>
      <v-dialog v-model="showDialog" max-width="600">
        <v-card>
          <v-card-text>
            Soll die Verknüpfung
            <span class="font-italic">{{link.id}}</span> zwischen
            <span class="font-weight-black">{{link.source.title}}</span> und
            <span class="font-weight-black">{{link.target.title}}</span> aufgehoben werden?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click.native="showDialog=false">Abbrechen</v-btn>
            <v-btn color="primary" flat @click.native="removeLink">Verknüpfung aufheben</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list-tile>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue/types/options";
import { AppElement, AppLink } from "~/types/app";

export default Vue.extend({
  props: {
    element: { type: Object as Prop<AppElement> },
    link: { type: Object as Prop<AppLink>, default: {} as AppLink },
    index: { type: Number }
  },
  components: {},
  methods: {
    removeLink(ev) {
      this.showDialog = false;
      //TODO
    }
  },
  data() {
    return {
      showDialog: false,
      showMenu: false
    };
  },
  computed: {
    title(): string {
      const link = this.link;
      return this.inbound
        ? link.source
          ? link.source.title
          : link.sourceId
        : (link.target ? link.target.title : link.targetId) || "";
    },
    subtitle(): string {
      return this.link.type;
    },
    inbound(): boolean {
      return this.element.id == this.link.targetId;
    },
    to(): string {
      const toId = this.inbound ? this.link.sourceId : this.link.targetId;
      return "/editor/" + toId;
    }
  }
});
</script>

<style lang="stylus" scoped>
.avatar-with-badge {
  min-width: 40px;
}

.list-item-content {
  margin-left: 16px;
}

>>> .v-list .v-list__tile {
  cursor: pointer;
}
</style>
