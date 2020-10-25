<template>
  <v-app>
    <v-app-bar class="app-bar" app clipped-left clipped-right flat border color="primary" dark>
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

      <portal-target name="toolbar" />
      <v-spacer />
      <AppAccountBtn
        v-if="$auth.profile"
        :username="$auth.profile.username"
        :prename="$auth.profile.firstName"
        :lastname="$auth.profile.lastName"
        :email="$auth.profile.email"
        @logout="$auth.logout()"
      />
    </v-app-bar>

    <AppTabBar :items="nav" :drawer.sync="drawer" />

    <v-main style="height: 100vh; overflow: hidden;">
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

import AppBarLogo from '~/components/layout/AppBarLogo.vue'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppAccountBtn from '~/components/layout/AppAccountBtn.vue'

export default Vue.extend({
  components: {
    AppBarLogo,
    AppTabBar,
    AppAccountBtn
  },
  data() {
    return {
      drawer: false as boolean,
      domains: ['Datenschutz', 'ISO 27001'],
      units: []
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
          name: 'help',
          icon: 'mdi-help',
          to: '/help',
          visible: true // this.$route.path.startsWith('/help')
        }
      ]
    }
  },
  head() {
    return {
      title: 'vernice.veo'
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

/*.domain-select {
  position: absolute;
  left: 220px;
  top: 13px;
  width: 190px; // Workaround bis sich das Select automatisch verkleinern lässt
}*/

</style>
