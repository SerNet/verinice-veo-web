<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense small v-bind="attrs" v-on="on">{{ value }}</v-icon>
    </template>
    <span>{{ $t(ruleEffectName) }}</span>
  </v-tooltip>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: String as PropType<'mdi-eye-outline' | 'mdi-eye-off-outline'>
    }
  },
  data() {
    return {
      ruleIconsMap: {
        'mdi-eye-outline': 'SHOW',
        'mdi-eye-off-outline': 'HIDE'
      }
    }
  },
  computed: {
    ruleEffectName(): string {
      return this.ruleIconsMap[this.value]
    }
  }
})
</script>

<i18n>
{
  "en": {
    "SHOW": "The element will be shown based on a rule",
    "HIDE": "The element will be hidden based on a rule" 
  },
  "de": {
    "SHOW": "Das Element wird basierend auf einer Regel angezeigt",
    "HIDE": "Das Element wird basierend auf einer Regel versteckt" 
  }
}
</i18n>
