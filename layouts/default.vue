<template>
  <v-app>
    <v-app-bar class="veo-app-bar" app clipped-left flat>
      <div class="d-flex">
        <v-app-bar-nav-icon v-if="$vuetify.breakpoint.xs" @click="drawer = true" />
        <nuxt-link to="/" class="text-decoration-none">
          <AppBarLogo class="ml-2" />
        </nuxt-link>
      </div>
      <div class="d-flex align-center" style="width: 60%; max-width: 500px; cursor: no-drop">
        <v-text-field
          :label="$t('search.label')"
          hide-details
          background-color="grey"
          height="40"
          disabled
          class="veo-app-bar-search"
        />
      </div>
      <AppAccountBtn
        v-if="$user.auth.profile"
        :username="$user.auth.profile.username"
        :prename="$user.auth.profile.firstName"
        :lastname="$user.auth.profile.lastName"
        :email="$user.auth.profile.email"
        @logout="$user.auth.logout('/')"
      />
      <span v-else />
    </v-app-bar>
    <VeoPrimaryNav v-model="drawer" />
    <v-main style="max-height: 100vh;" class="overflow-hidden">
      <VeoBreadcrumbs :custom-breadcrumbs="customBreadcrumbs" />
      <VeoPageWrapper>
        <nuxt />
      </VeoPageWrapper>
    </v-main>
    <VeoSnackbar v-model="snackbar.value" v-bind="snackbar" />
    <VeoAlert
      v-model="alert.value"
      v-bind="alert"
      style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
    />
    <VeoNewUnitDialog v-model="newUnitDialog.value" v-bind="newUnitDialog" />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, useContext } from '@nuxtjs/composition-api'

import AppBarLogo from '~/components/layout/AppBarLogo.vue'
import VeoPrimaryNav from '~/components/layout/VeoPrimaryNavigation.vue'
import AppAccountBtn from '~/components/layout/AppAccountBtn.vue'
import VeoNewUnitDialog from '~/components/dialogs/VeoNewUnitDialog.vue'
import VeoSnackbar from '~/components/layout/VeoSnackbar.vue'
import VeoAlert, { ALERT_TYPE } from '~/components/layout/VeoAlert.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    AppBarLogo,
    VeoPrimaryNav,
    AppAccountBtn,
    VeoNewUnitDialog,
    VeoSnackbar,
    VeoAlert,
    VeoPageWrapper
  },
  setup(_props, context) {
    const customBreadcrumbs = [
      {
        '/:unit/objects/:type/:group/:id/history': [
          {
            text: 'Dashboard',
            to: '/:unit'
          },
          {
            text: 'Test Text',
            to: '/:unit/objects/:type'
          }
        ]
      }
    ]
    const { $user } = useContext()
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false)

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

    // Alert and snackbar events
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

    // UI related events (unit switch/creation)
    context.root.$on(VeoEvents.UNIT_CREATE, (persistent: boolean) => {
      createUnit(persistent)
    })

    context.root.$on(VeoEvents.UNIT_CHANGED, (newUnit: string) => {
      $user.currentDomain = undefined
      context.root.$router.push('/' + newUnit)
    })

    return { alert, drawer, newUnitDialog, snackbar, customBreadcrumbs }
  },
  head() {
    return {
      titleTemplate: '%s - verinice.veo'
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-app-bar {
  background-color: white !important;
  box-shadow: inset 0 -1px 0 $grey !important;

  .v-toolbar__content {
    > * {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
}

.veo-app-bar-search {
  border-radius: 4px;

  ::v-deep .v-input__slot {
    padding: 0 16px;
  }

  ::v-deep .v-input__slot:before {
    border-top: 0 !important;
  }
}
</style>
