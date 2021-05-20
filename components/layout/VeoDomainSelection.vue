<template>
  <v-list-item dense>
    <v-list-item-content>
      <v-select
        :value="currentDomain"
        :items="availableDomains"
        item-text="displayName"
        item-value="domainId"
        :disabled="!unitIsSet"
        dense
        outlined
        hide-details
        :label="$t('label')"
        @input="doChangeDomain"
      />
    </v-list-item-content>
  </v-list-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { separateUUIDParam } from '~/lib/utils'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoDomain } from '~/types/VeoTypes'

export default Vue.extend({
  props: {
    domains: {
      type: Array as Prop<IVeoDomain[]>,
      required: true
    }
  },
  computed: {
    currentDomain(): string | undefined {
      return this.$user.currentDomain
    },
    availableDomains(): { displayName: string; domainId: string }[] {
      return this.domains.map((entry: IVeoDomain) => ({
        displayName: entry.displayName,
        domainId: entry.targetUri.split('/').pop() as string
      }))
    },
    unitIsSet(): boolean {
      return (this.$route.params.unit && separateUUIDParam(this.$route.params.unit).id) !== undefined
    }
  },
  methods: {
    doChangeDomain(domain: string) {
      this.$user.currentDomain = domain
      this.$emit(VeoEvents.DOMAIN_CHANGED, domain)
    }
  }
})
</script>

<i18n>
{
  "en": {
    "label": "Domain"
  },
  "de": {
    "label": "Domain"
  }
}  
</i18n>
