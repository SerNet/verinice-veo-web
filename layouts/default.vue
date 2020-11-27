<template>
  <v-app>
    <v-app-bar class="app-bar pl-0" app clipped-left clipped-right flat border color="primary" dark>
      <AppBarLogo>
        <v-app-bar-nav-icon color="primary" @click.stop="drawer = !drawer" />
      </AppBarLogo>
      <!--<v-select
        class="domain-select"
        :items="domains"
        :value="domains[0]"
        hide-details
        flat
        light
        :prepend-inner-icon="!$vuetify.breakpoint.xs?'mdi-domain':''"
        dense
        label="Domain"
        solo
      />-->

      <AppUnitSelection @create-unit="createUnit" />

      <portal-target name="toolbar" />

      <v-spacer />
      <AppAccountBtn
        v-if="$auth.profile"
        :username="$auth.profile.username"
        :prename="$auth.profile.firstName"
        :lastname="$auth.profile.lastName"
        :email="$auth.profile.email"
        @logout="$auth.logout('/')"
      />
    </v-app-bar>

    <AppTabBar :offset="$vuetify.application.top" :items="nav" :drawer.sync="drawer" />

    <v-main>
      <nuxt />
    </v-main>

    <VeoNewUnitDialog v-model="newUnitCreation" :persistent="newUnitPersistent" />

    <v-footer app padless inset outlined>
      <portal-target style="width: 100%" name="footer" />
    </v-footer>

    <VeoSnackbar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

import AppBarLogo from '~/components/layout/AppBarLogo.vue'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppAccountBtn from '~/components/layout/AppAccountBtn.vue'
import AppUnitSelection from '~/components/layout/AppUnitSelection.vue'
import VeoNewUnitDialog from '~/components/dialogs/VeoNewUnitDialog.vue'
import VeoSnackbar from '~/components/layout/VeoSnackbar.vue'

export default Vue.extend({
  components: {
    AppBarLogo,
    AppTabBar,
    AppAccountBtn,
    AppUnitSelection,
    VeoNewUnitDialog,
    VeoSnackbar
  },
  data() {
    return {
      drawer: false as boolean,
      domains: ['Datenschutz', 'ISO 27001'],
      units: [],
      newUnitCreation: false as boolean,
      newUnitPersistent: false as boolean
    }
  },
  computed: {
    nav(): Array<any> {
      return [
        {
          name: 'dashboard',
          icon: 'mdi-home',
          exact: true,
          to: `/${this.$route.params.unit}/`
        },
        {
          name: 'veo.data',
          icon: 'mdi-folder',
          to: `/${this.$route.params.unit}/data`
        },
        {
          name: 'veo.forms',
          icon: 'mdi-format-list-checks',
          to: `/${this.$route.params.unit}/forms`
        },
        {
          name: 'settings',
          icon: 'mdi-cog',
          to: `/${this.$route.params.unit}/settings`
        },
        {
          name: 'Editor',
          icon: 'mdi-application-cog',
          to: '/editor',
          exact: true
        }
      ]
    }
  },
  methods: {
    createUnit(persistent: boolean = false) {
      this.newUnitCreation = true
      this.newUnitPersistent = persistent
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep .v-main__wrap {
  border-top: 1px solid #e0e0e0;
}
::v-deep .language-btn .v-input__control div[role='combobox'].v-input__slot {
  padding-right: 0;
}
::v-deep .language-btn input {
  min-width: 1px !important;
  margin: 0 !important;
}
::v-deep .language-btn .v-select__selection.v-select__selection--comma {
  margin: 0 !important;
}

.v-footer {
  border-right: none;
  border-bottom: none;
  border-left: none;
}

.app-bar {
  overflow: hidden;
}

/*.domain-select {
  position: absolute;
  left: 220px;
  top: 13px;
  width: 190px; // Workaround bis sich das Select automatisch verkleinern lässt
}*/

</style>
