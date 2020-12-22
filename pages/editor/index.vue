<template>
  <VeoPage>
    <h2>{{ $t('page.editors.calltoaction') }}</h2>
    <v-list two-line class="overflow-hidden">
      <v-list-item to="/editor/objectschema">
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">
            {{ $t('editor.objectschema.headline') }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('editor.objectschema.description') }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon x-large>mdi-chevron-right</v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-list-item to="/editor/formschema">
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">
            {{ $t('editor.formschema.headline') }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('editor.formschema.description') }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon x-large>mdi-chevron-right</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage
  },
  head(): any {
    return {
      title: 'verinice.veo'
    }
  }
})
</script>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
