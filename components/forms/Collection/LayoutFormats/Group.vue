<template>
  <v-col v-if="visible" cols="12" md="auto" class="vf-layout vf-group" :id="groupId">
    <v-row dense class="flex-column" :class="dynamicClasses" :style="options && options.style">
      <v-col v-if="options && options.label">
        <h3>{{ options.label }}</h3>
      </v-col>
      <v-col>
        <v-row
          :dense="options && options.direction === 'horizontal'"
          :class="directionClass"
          :style="options && options.style"
        >
          <slot />
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

import { calculateConditionsScore, Helpful, LayoutProps } from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'Group',
  props: {
    options: Object,
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
  },
  data() {
    return {
      groupIdPattern: /\//g,
      replaceWith: '-'
    }
  },
  computed: {
    directionClass(): string {
      if (this.options && this.options.direction === 'horizontal') {
        return 'flex-row direction-horizontal'
      } else {
        return 'flex-column direction-vertical'
      }
    },
    dynamicClasses(): string[] {
      return [this.options && this.options.class ? this.options.class : '']
    },
    groupId(): string {
      return this.formSchemaPointer.slice(2).replace(this.groupIdPattern, this.replaceWith)
    }
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [typeof props.options !== 'undefined' && props.options.format === 'group'],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped>
.vf-layout.vf-group > .border {
  border-radius: 5px !important;
  border: 1px dashed #cccccc;
  padding: 8px;
}

.direction-horizontal > .vf-control {
  ::v-deep {
    & > .vf-autocomplete,
    & > .vf-input-date,
    & > .vf-input-date-time,
    & > .vf-input-number,
    & > .vf-input-text,
    & > .vf-input-text-multiline,
    & > .vf-input-uri,
    & > .vf-markdown-editor,
    & > .vf-select,
    & > .vf-tags {
      margin-top: 12px !important;
      margin-bottom: 12px !important;
    }

    & > .vf-array-field,
    & > .vf-checkbox,
    & > .vf-links-field,
    & > .vf-radio {
      display: inline-block;
      margin-top: 12px !important;
      margin-bottom: 12px !important;
    }
  }
}

::v-deep {
  & > .vf-input-text-multiline,
  & > .vf-markdown-editor,
  & > .vf-autocomplete,
  & > .vf-checkbox,
  & > .vf-input-date,
  & > .vf-input-date-time,
  & > .vf-input-number,
  & > .vf-input-text,
  & > .vf-input-uri,
  & > .vf-select,
  & > .vf-tags {
    max-width: 100%;
  }
}
</style>
