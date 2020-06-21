<template>
  <v-app id="inspire">
    <v-app-bar class="app-bar" app clipped-left clipped-right flat border color="primary" dark>
      <AppBarLogo>
        <v-app-bar-nav-icon color="primary" @click.stop="drawer = !drawer" />
      </AppBarLogo>
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

    <v-content>
      <nuxt />
    </v-content>
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
      nav: [
        {
          name: 'dashboard',
          icon: 'mdi-home',
          to: '/'
        },
        {
          name: 'veo.data',
          icon: 'mdi-folder',
          to: '/data'
        },
        {
          name: 'veo.forms',
          icon: 'mdi-format-list-checks',
          to: '/forms'
        },
        {
          name: 'settings',
          icon: 'mdi-cog',
          to: '/settings'
        }
      ]
    }
  },
  computed: {}
})
</script>

<style lang="scss" scoped>
::v-deep .v-content__wrap {
  border-top: 1px solid #e0e0e0;
}
</style>
