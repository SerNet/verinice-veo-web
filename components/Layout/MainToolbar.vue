<template>
  <v-toolbar app class="elevation-0" color="primary" dark style="overflow:hidden;" :clipped-left="clipped" id="mainToolbar">
    <main-toolbar-logo v-if="!showSearch"/>
    <v-toolbar-side-icon light class="hidden-sm-and-up" @click.stop="toggleDrawer()" v-if="!showSearch" style="color: #e53935"/>

    <!-- normale Suche -->
    <!--<v-layout class="hidden-sm-and-down" row justify-space-around style="margin-left: 200px;">
      <v-flex v-if="search" xs12 sm6 align-content-center>
        <v-text-field solo light single-line label="In verinice suchen"/>
      </v-flex>
    </v-layout>-->
    <!-- mobile Suche -->
    <!--<v-layout v-if="search" class="hidden-md-and-up" row justify-space-around style="margin-left: 20px;">
      <v-flex xs12>
        <v-text-field solo light single-line label="In verinice suchen" v-if="showSearch"/>
      </v-flex>
      <v-btn icon @click="toggleSearch()">
        <v-icon>{{showSearch?'close':'search'}}</v-icon>
      </v-btn>
    </v-layout>-->
    <v-spacer></v-spacer>
    <account-btn v-if="username && !showSearch" :username="username" @logout="onLogout"></account-btn>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbarLogo from "~/components/Layout/MainToolbarLogo.vue";
import AccountBtn from "~/components/Layout/AccountBtn.vue";
import LoginDialog from "~/components/Layout/LoginDialog.vue";
import { helpers as authStore } from "~/store/modules/auth";

export default Vue.extend({
  components: {
    MainToolbarLogo,
    AccountBtn,
    LoginDialog
  },
  data() {
    return {
      showSearch: !!this.search
    };
  },
  computed: {
    ...authStore.mapState({
      username: "username",
      authError: "error"
    })
  },
  props: {
    clipped: { type: Boolean },
    search: { type: Boolean }
  },
  methods: {
    toggleDrawer() {
      this.$emit("click-side-icon");
    },
    toggleSearch() {
      this.showSearch = !this.showSearch;
    },
    ...authStore.mapActions({
      login: "login",
      logout: "logout"
    }),
    async onLogout() {
      await this.logout({});
      this.$router.go(this.$router.currentRoute as any);
    }
  }
});
</script>

<style lang="stylus" scoped>
.v-toolbar {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

#mainToolbar >>> .v-toolbar__content {
  padding-left: 0;
}

.v-input >>> .v-input__slot {
  margin-bottom: 0;
}
</style>
