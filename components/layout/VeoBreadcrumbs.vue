<template>
  <v-breadcrumbs :items="items" class="px-4 py-3 text-capitalize">
    <template #divider>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from '@nuxtjs/composition-api'

interface IBreadcrumbEntry {
  disabled: boolean,
  exact: boolean,
  text: string,
  to: string
}

interface IProps {}

export default defineComponent<IProps>({
  setup(_props, context) {
    const items: ComputedRef<IBreadcrumbEntry[]> = computed(() => {
      const pathArray: string[] = context.root.$route.path.split('/').filter((el: string) => el !== '')
      const returnArray = [
        ...pathArray.map((el: string, i: number) => ({
          text: el,
          to: `/${pathArray.slice(0, i + 1).join('/')}/`,
          exact: true,
          disabled: false
        }))
      ]
      returnArray.unshift({
        disabled: false,
        exact: true,
        text: context.root.$i18n.t('page.index.title') as string,
        to: '/'
      })
      return returnArray
    })

    return { items }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
