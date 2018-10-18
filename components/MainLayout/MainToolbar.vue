<template>
  <v-toolbar class="elevation-0" app color="primary" dark="" style="overflow:hidden;" :clipped-left="clipped" id="mainToolbar">
    <main-toolbar-logo v-if="!showSearch" />
    <v-toolbar-side-icon light class="hidden-sm-and-up" @click.stop="toggleDrawer()" v-if="!showSearch" style="color: #e53935" />

    <!-- normale Suche -->
    <v-layout class="hidden-sm-and-down" row justify-space-around style="margin-left: 200px;">
      <v-flex xs12 sm6 align-content-center>
        <v-text-field solo light single-line label="In verinice suchen" />
      </v-flex>
    </v-layout>

    <!-- mobile Suche -->
    <v-layout class="hidden-md-and-up" row justify-space-around style="margin-left: 20px;">
      <v-flex xs12>
        <v-text-field solo light single-line label="In verinice suchen" v-if="showSearch" />
      </v-flex>
      <v-btn icon @click="toggleSearch()">
        <v-icon>{{showSearch?'close':'search'}}</v-icon>
      </v-btn>
    </v-layout>

    <template v-if="!showSearch">
      <account-btn v-if="username" :username="username" @logout="logout"></account-btn>
      <login-dialog v-else @login="login" :error="authError"></login-dialog>
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbarLogo from "~/components/MainLayout/MainToolbarLogo.vue";
import AccountBtn from "~/components/MainLayout/AccountBtn.vue";
import LoginDialog from "~/components/MainLayout/LoginDialog.vue";
import { helpers as authStore } from "~/store/modules/auth";

export default Vue.extend({
  components: {
    MainToolbarLogo,
    AccountBtn,
    LoginDialog
  },
  data() {
    return {
      showSearch: false
    };
  },
  computed: {
    ...authStore.mapState({
      username: "username",
      authError: "error"
    })
  },
  props: ["clipped", "value"],
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
    })
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
