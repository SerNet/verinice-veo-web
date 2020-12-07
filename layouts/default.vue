<template>
  <v-app>
    <v-app-bar class="app-bar pl-0" app clipped-left clipped-right flat border color="primary" dark>
      <AppBarLogo>
        <v-app-bar-nav-icon color="primary" @click.stop="drawer = !drawer" />
      </AppBarLogo>
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
    <AppTabBar :offset="$vuetify.application.top" :items="navItems" :drawer.sync="drawer" />
    <v-main>
      <nuxt />
      <VeoSnackbar v-model="snackbar.value" v-bind="snackbar" />
      <VeoAlert v-model="alert.value" v-bind="alert" style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1" />
    </v-main>
    <VeoNewUnitDialog v-model="newUnitDialog.value" v-bind="newUnitDialog" />
  </v-app>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from '@nuxtjs/composition-api'

import AppBarLogo from '~/components/layout/AppBarLogo.vue'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppAccountBtn from '~/components/layout/AppAccountBtn.vue'
import AppUnitSelection from '~/components/layout/AppUnitSelection.vue'
import VeoNewUnitDialog from '~/components/dialogs/VeoNewUnitDialog.vue'
import VeoSnackbar from '~/components/layout/VeoSnackbar.vue'
import VeoAlert, { ALERT_TYPE } from '~/components/layout/VeoAlert.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    AppBarLogo,
    AppTabBar,
    AppAccountBtn,
    AppUnitSelection,
    VeoNewUnitDialog,
    VeoSnackbar,
    VeoAlert
  },
  setup(_props, context) {
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false)
    const navItems = computed(() => [
      {
        name: 'dashboard',
        icon: 'mdi-home',
        exact: true,
        to: `/${context.root.$route.params.unit}/`
      },
      {
        name: 'veo.data',
        icon: 'mdi-folder',
        to: `/${context.root.$route.params.unit}/data`
      },
      {
        name: 'veo.forms',
        icon: 'mdi-format-list-checks',
        to: `/${context.root.$route.params.unit}/forms`
      },
      {
        name: 'settings',
        icon: 'mdi-cog',
        to: `/${context.root.$route.params.unit}/settings`
      },
      {
        name: 'help',
        icon: 'mdi-help',
        to: `/${context.root.$route.params.unit}/help`
      },
      {
        name: 'Editor',
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: true
      }
    ])

    //
    // Unit creation and navigation
    //
    const newUnitDialog = ref({ value: false, persistent: false })

    function createUnit(persistent: boolean = false) {
      newUnitDialog.value.value = true
      newUnitDialog.value.persistent = persistent
    }

    //
    // Handling of global events
    //
    const alert = ref({ value: false, content: '', title: '', type: ALERT_TYPE.INFO })
    const snackbar = ref({ value: false, text: '' })

    context.root.$on(VeoEvents.ALERT_ERROR, (payload: VeoEventPayload) => {
      alert.value.content = payload.text
      alert.value.title = payload.title || ''
      alert.value.type = ALERT_TYPE.ERROR
      alert.value.value = true
    })
    context.root.$on(VeoEvents.ALERT_INFO, (payload: VeoEventPayload) => {
      alert.value.content = payload.text
      alert.value.title = payload.title || ''
      alert.value.type = ALERT_TYPE.INFO
      alert.value.value = true
    })
    context.root.$on(VeoEvents.ALERT_SUCCESS, (payload: VeoEventPayload) => {
      alert.value.content = payload.text
      alert.value.title = payload.title || ''
      alert.value.type = ALERT_TYPE.SUCCESS
      alert.value.value = true
    })
    context.root.$on(VeoEvents.ALERT_WARNING, (payload: VeoEventPayload) => {
      alert.value.content = payload.text
      alert.value.title = payload.title || ''
      alert.value.type = ALERT_TYPE.WARNING
      alert.value.value = true
    })
    context.root.$on(VeoEvents.ALERT_CLOSE, () => {
      alert.value.value = false
    })

    context.root.$on(VeoEvents.SNACKBAR_SUCCESS, (payload: VeoEventPayload) => {
      snackbar.value.text = payload.text
      snackbar.value.value = true
    })
    context.root.$on(VeoEvents.SNACKBAR_CLOSE, () => {
      snackbar.value.value = false
    })

    return { alert, createUnit, drawer, navItems, newUnitDialog, snackbar }
  }
})
</script>

<style lang="scss" scoped>
</style>
