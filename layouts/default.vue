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

      <v-select class="unit-select" :items="units" item-text="name" item-value="id" :value="unit" hide-details flat light dense label="Unit" solo @change="changeUnit" />
      <!--:prepend-inner-icon="!$vuetify.breakpoint.xs?'mdi-domain':''"-->

      <v-spacer />

      <v-overflow-btn
        :value="$i18n.locale"
        :items="langs"
        class="language-btn"
        color="primary"
        label="Languages"
        flat
        dense
        solo
        outlined
        hide-details
        background-color="transparent"
        @input="$i18n.setLocale($event)"
      ></v-overflow-btn>

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

    <v-main>
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
  async fetch() {
    this.units = await this.$api.unit.fetchAll()
  },
  data() {
    return {
      drawer: false as boolean,
      domains: ['Datenschutz', 'ISO 27001'],
      units: [],
      langs: [
        { value: 'en', text: 'English' },
        { value: 'de', text: 'Deutsch' }
      ]
    }
  },
  computed: {
    unit(): string | undefined {
      return this.$route.params.unit || undefined
    },
    nav(): Array<any> {
      return [
        {
          name: 'dashboard',
          icon: 'mdi-home',
          exact: true,
          to: `/${this.unit}/`
        },
        {
          name: 'veo.data',
          icon: 'mdi-folder',
          to: `/${this.unit}/data`
        },
        {
          name: 'veo.forms',
          icon: 'mdi-format-list-checks',
          to: `/${this.unit}/forms`
        },
        {
          name: 'settings',
          icon: 'mdi-cog',
          to: `/${this.unit}/settings`
        }
      ]
    }
  },
  methods: {
    changeUnit(e: string) {
      this.$router.push('/' + e)
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep .v-main__wrap {
  border-top: 1px solid #e0e0e0;
}

.language-btn {
  max-width: 120px;
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

.unit-select {
  position: absolute;
  left: 220px;
  top: 13px;
  width: 190px; // Workaround bis sich das Select automatisch verkleinern lässt
}

@media only screen and (max-width: 599px /* 959 */) {
  /*.domain-select {
    left: 120px;
    top: 8px;
    width: 152px;// Workaround bis sich das Select automatisch verkleinern lässt
  }*/
  .unit-select {
    left: 120px;
    top: 8px;
    width: 152px; // Workaround bis sich das Select automatisch verkleinern lässt
  }
}
</style>
