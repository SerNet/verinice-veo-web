<template>
  <v-breadcrumbs :items="breadcrumbItems" class="px-4 py-3">
    <template #item="{ item }">
      <v-menu v-if="item.menuItems" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn color="primary" x-small text v-bind="attrs" v-on="on">
            {{ item.text }}
          </v-btn>
        </template>
        <v-list dense class="py-0">
          <v-list-item
            v-for="(menuItem, index) in item.menuItems"
            :to="menuItem.to"
            :exact="menuItem.exact"
            :key="index"
          >
            <v-list-item-title v-if="menuItem.text" class="primary--text font-weight-regular">{{
              menuItem.text
            }}</v-list-item-title>
            <v-icon v-else-if="menuItem.icon" small class="primary--text">{{ menuItem.icon }}</v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-breadcrumbs-item v-if="!item.menuItems" :to="item.to" :disabled="item.disabled" :exact="item.exact">
        <template v-if="item.text">
          {{ item.text }}
        </template>
        <v-icon v-else-if="item.icon" style="color: inherit">{{ item.icon }}</v-icon>
      </v-breadcrumbs-item>
    </template>
    <template #divider>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { ref, defineComponent, watch, Ref, PropOptions, useContext } from '@nuxtjs/composition-api'
import { capitalize, last, intersection } from 'lodash'
import { separateUUIDParam } from '~/lib/utils'
import { getSchemaEndpoint } from '~/plugins/api/schema'

interface IBaseStringObject {
  [key: string]: string
}

interface IBaseBreadcrumbEntry {
  text: string
  to: string
  icon?: string
}

interface IBreadcrumbEntry extends IBaseBreadcrumbEntry {
  disabled: boolean
  exact: boolean
}

// TODO: check if :group should be added here, after groups are implemented
type ParamsWithUUID = ':form' | ':object' | ':id'

interface ICustomBreadcrumbEntry {
  [key: string]: IBaseBreadcrumbEntry[]
}

interface ICollapsedBreadcrumbEntry {
  text: string
  menuItems: IBreadcrumbEntry[]
}

interface ICustomBreadcrumbTextEntry {
  [key: string]: { text: string; icon?: string }
}

interface IProps {
  customBreadcrumbs: ICustomBreadcrumbEntry
}

export default defineComponent<IProps>({
  props: {
    customBreadcrumbs: {
      type: Object
    } as PropOptions<ICustomBreadcrumbEntry>
  },
  setup(_props, context) {
    /**
     * Definitions of custom values
     */

    // Notice: to define custom translations for parameters from route path (objectschema, formschema, help, ...)
    // Define values in de.ts and en.ts with this pattern breadcrumbs.PARAMETER (e.g. breadcrumbs.objectschema)

    // Define which keys from path should be replaces with custom Text
    let breadcrumbsReplacement: ICustomBreadcrumbTextEntry = {
      ':unit': { text: '', icon: 'mdi-home' },
      forms: { text: context.root.$t('breadcrumbs.forms') as string },
      objects: { text: context.root.$t('breadcrumbs.objects') as string }
    }

    // TODO: check if :group should be added here, after groups are implemented
    // Definition of route fragments in path, which is represented with UUID in standard path
    const paramsWithUUID: ParamsWithUUID[] = [':form', ':object', ':id']

    // KeyMap for definition of object properties which represent displayName
    const displayNameKeyMap = {
      ':form': 'name',
      ':object': 'name', // TODO: change to displayName after implemented
      ':id': 'name' // TODO: change to displayName after implemented
    }

    // KeyMap for definition of KEY in $api.KEY.fetch()
    const apiKeyMap = {
      ':form': 'form',
      ':object': 'entity',
      ':id': 'entity'
    }

    // Default properties for Breadcrumb listItem
    const defaultListItem = { exact: true, disabled: false }

    // Definition of collapse threshold for breadrumb listItems
    const collapseThreshold = 6

    /**
     * Definitions of variables
     */

    const breadcrumbItems: Ref<(IBreadcrumbEntry | ICollapsedBreadcrumbEntry)[]> = ref([])

    /**
     * Definitions of functions
     */

    // Receive a titel of a dynamic parameter value (type-UUID) from server and cache it
    async function getUUIDParamTitel(type: ParamsWithUUID, param: string) {
      // "param" has always pattern: type-UUID, where type can be form, process, control, asset, ...
      const paramSeparated = separateUUIDParam(param)

      // If a parameter title is already cached, return its value
      if (sessionStorage.getItem(paramSeparated.id)) {
        return { [type]: { text: sessionStorage.getItem(paramSeparated.id) as string } }
      }

      // If a parameter title is not cached, send request to server and cache it in Session Storage
      return new Promise<ICustomBreadcrumbTextEntry>(async resolve => {
        const apiKey = apiKeyMap[type]
        const displayNameKey = displayNameKeyMap[type]
        // @ts-ignore
        const api = context.root.$api[apiKey]
        const text: string =
          apiKey === 'entity'
            ? (await api.fetch(getSchemaEndpoint(paramSeparated.type), paramSeparated.id))[displayNameKey]
            : (await api.fetch(paramSeparated.id))[displayNameKey]

        sessionStorage.setItem(paramSeparated.id, text)
        resolve({ [type]: { text } })
      })
    }

    // Get text for listItem: it can be custom text, translation or just parameters from route path (forms, :unit, ...)
    function getText(params: IBaseStringObject, param: string) {
      const text: string =
        params[param] ||
        (context.root.$i18n.te('breadcrumbs.' + param) && (context.root.$i18n.t('breadcrumbs.' + param) as string)) ||
        param
      return capitalize(text)
    }

    // Generate route paths for each listItem of standard breadcrumbs
    function generatItemRoute(routes: string[], params: IBaseStringObject, index: number): string {
      return `/${routes
        .slice(0, index + 1)
        .map(route => params[route] || route)
        .join('/')}/`
    }

    // Generate custom breadcrumbs if a user externally defined component props "customBreadcrumbs"
    function generateCustomBreadcrumb(pathTemplate: string, params: IBaseStringObject) {
      return _props.customBreadcrumbs[pathTemplate].map(item => {
        return {
          ...defaultListItem,
          ...item,
          to: item.to.replace(/:\w+/g, paramKey => params[paramKey])
        }
      })
    }

    // Generate standard (dynamic) breadcrumbs with translations, dynamic titels for UUID parameters and custom text
    async function generateStandardBreadcrumb(
      pathTemplate: string,
      params: IBaseStringObject
    ): Promise<IBreadcrumbEntry[]> {
      // Keys from path in general form Dynamic (e.g. - :unit, :object), Static (e.g. - forms, objects)
      const routes: string[] = pathTemplate.split('/').filter((el: string) => el !== '')

      // Parameters from with UUID which currently exist in route path
      const usedParamsWithUUID = intersection(paramsWithUUID, routes) as ParamsWithUUID[]

      // Load titels for UUID parameters dynamically
      const dynamicUUIDTitels = await Promise.all(
        usedParamsWithUUID.map((param: ParamsWithUUID) => {
          return getUUIDParamTitel(param, params[param])
        })
      )
      // Add these titels with their parameter names to breadcrumsReplacement object to replace default values with dynamic ones in the loop
      dynamicUUIDTitels.forEach((titelObject: ICustomBreadcrumbTextEntry) => {
        breadcrumbsReplacement = { ...breadcrumbsReplacement, ...titelObject }
      })

      // Generate for each route parameter dynamic breadcrumbs listItem
      return routes.map((param: string, i: number) => {
        const item = breadcrumbsReplacement[param]
          ? { ...breadcrumbsReplacement[param] }
          : { text: getText(params, param) }
        return {
          ...defaultListItem,
          ...item,
          to: generatItemRoute(routes, params, i)
        }
      })
    }

    // Collapse breadcrumbs listItems, if number of them is higher than the custom threshold, else return original listItems
    function collapseBreadcrumb(listItems: IBreadcrumbEntry[]): (ICollapsedBreadcrumbEntry | IBreadcrumbEntry)[] {
      const numberOfNotCollapsedListItems = collapseThreshold - 2
      const sliceEndIndexForCollapsedListItems = listItems.length - numberOfNotCollapsedListItems
      // If list items are longer than required, listItems should be collapsed
      return listItems.length >= collapseThreshold
        ? [
            { text: '•••', menuItems: listItems.slice(0, sliceEndIndexForCollapsedListItems) },
            ...listItems.slice(sliceEndIndexForCollapsedListItems)
          ]
        : listItems
    }

    /**
     * Definition of watchers for route changes
     */

    watch(
      () => context.root.$route.fullPath,
      async () => {
        // Parameters map from route path
        const params: IBaseStringObject = {}
        Object.entries(context.root.$route.params).forEach(([key, value]) => {
          params[`:${key}`] = value
        })

        // Pathtemplate is general definition of current path without real values (e.g. /:unit/forms/:form)
        const pathTemplate = last(context.root.$route.matched)?.path
        if (pathTemplate) {
          const listItems: IBreadcrumbEntry[] =
            _props.customBreadcrumbs && _props.customBreadcrumbs[pathTemplate]
              ? generateCustomBreadcrumb(pathTemplate, params)
              : await generateStandardBreadcrumb(pathTemplate, params)

          breadcrumbItems.value = collapseBreadcrumb(listItems)
        } else {
          console.warn('Pathtemplate is undefined in Breadcrumbs')
          breadcrumbItems.value = []
        }
      },
      { immediate: true }
    )

    /**
     * Definition of returned values to templace
     */

    return { breadcrumbItems }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
