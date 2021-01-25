<template>
  <v-breadcrumbs :items="items" class="px-4 py-3">
    <template v-slot:item="{ item }">
      <v-menu v-if="item.menuItems" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" x-small text v-bind="attrs" v-on="on">
            {{ item.text }}
          </v-btn>
        </template>
        <v-list dense outlined>
          <v-list-item
            v-for="(menuItem, index) in item.menuItems"
            :to="menuItem.to"
            :exact="menuItem.exact"
            :key="index"
          >
            <v-list-item-title class="primary--text font-weight-regular">{{ menuItem.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-breadcrumbs-item v-if="!item.menuItems" :to="item.to" :disabled="item.disabled" :exact="item.exact">
        {{ item.text }}
      </v-breadcrumbs-item>
    </template>
    <template #divider>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { computed, ComputedRef, ref, defineComponent, watch, reactive, Ref } from '@nuxtjs/composition-api'
import { capitalize, last, intersection } from 'lodash'

interface IBreadcrumbEntry {
  disabled: boolean
  exact: boolean
  text: string
  to: string
}

interface IProps {}
type ParamsWithUUID = ':form' | ':object' | ':group' | ':id'

interface IUUIDParamTitel {
  [key: string]: { text: string | null }
}

export default defineComponent<IProps>({
  setup(_props, context) {
    let items: Ref<IBreadcrumbEntry[]> = ref([])
    const apiNames: any = {
      ':form': 'form',
      ':object': null, // Problem with getting API path (process, control, ...)
      ':group': 'group',
      ':id': null // Problem with getting API path (process, control, ...)
    }
    async function getUUIDParamTitel(type: ParamsWithUUID, uuid: string) {
      if (sessionStorage.getItem(uuid)) {
        return { [type]: { text: sessionStorage.getItem(uuid) } }
      }
      return new Promise<IUUIDParamTitel>(resolve =>
        setTimeout(() => {
          const title = capitalize(type.slice(1)) + 'DisplayName'
          console.log(title)
          sessionStorage.setItem(uuid, title)
          resolve({ [type]: { text: sessionStorage.getItem(uuid) } })
        }, 300)
      )
    }
    watch(
      () => context.root.$route.fullPath,
      async () => {
        const params: any = {}
        const paramsWithUUID: ParamsWithUUID[] = [':form', ':object', ':group', ':id']
        Object.entries(context.root.$route.params).forEach(([key, value]) => {
          params[`:${key}`] = value
        })
        let breadcrumbsReplacement: any = {
          ':unit': { text: 'Dashboard' },
          forms: { text: 'veo.Forms' },
          objects: { text: 'veo.Objects' }
        }
        const routes: string[] = last<any>(context.root.$route.matched)
          .path.split('/')
          .filter((el: string) => el !== '')

        const usedParamsWithUUID = intersection(paramsWithUUID, routes) as ParamsWithUUID[]
        const dynamicUUIDTitels = await Promise.all(
          usedParamsWithUUID.map((param: ParamsWithUUID) => {
            return getUUIDParamTitel(param, params[param])
          })
        )

        dynamicUUIDTitels.forEach((titelObject: IUUIDParamTitel) => {
          breadcrumbsReplacement = { ...breadcrumbsReplacement, ...titelObject }
        })

        console.log(JSON.stringify(breadcrumbsReplacement, null, 4))
        const returnArray = [
          ...routes.map((el: string, i: number) => {
            const item = breadcrumbsReplacement[el]
              ? { ...breadcrumbsReplacement[el] }
              : { text: capitalize(params[el] || el) }
            return {
              ...item,
              to: `/${routes
                .slice(0, i + 1)
                .map(route => params[route] || route)
                .join('/')}/`,
              exact: true,
              disabled: false
            }
          })
        ]
        console.log(context.root.$route, returnArray)

        items.value =
          returnArray.length >= 6
            ? [
                {
                  text: '...',
                  menuItems: returnArray.slice(0, returnArray.length - 4)
                },
                ...returnArray.slice(returnArray.length - 4)
              ]
            : returnArray
      },
      { immediate: true }
    )

    return { items }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
