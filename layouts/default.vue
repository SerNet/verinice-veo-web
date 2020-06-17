<template>
  <v-app id="inspire">
    <v-app-bar class="app-bar" app clipped-left clipped-right flat border color="primary" dark>
      <AppBarLogo />
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

    <AppSideBar v-if="!standalone" :items="itemsLeft" param="left" />
    <AppSideBar v-if="!standalone" :items="$navigation.data.right" param="right" right />

    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

import AppBarLogo from '~/components/layout/AppBarLogo.vue'
import AppSideBar from '~/components/layout/AppSideBar.vue'
import AppAccountBtn from '~/components/layout/AppAccountBtn.vue'
import { IItem } from '~/plugins/navigation'

export default Vue.extend({
  components: {
    AppBarLogo,
    AppSideBar,
    AppAccountBtn
  },
  data() {
    return {
      drawer: undefined as boolean | undefined,
      itemsLeft: [
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
          name: 'settings',
          icon: 'mdi-cog',
          to: '/settings'
        }
      ] as IItem[],
      itemsRight: [] as IItem[]
    }
  },
  computed: {
    standalone() {
      if (this.$vuetify.breakpoint.xs) {
        return true
      }
      return (
        'standalone' in this.$route.query &&
        !/false|0|off/i.test(String(this.$route.query.standalone))
      )
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep .v-content__wrap {
  border-top: 1px solid #e0e0e0;
}
</style>
