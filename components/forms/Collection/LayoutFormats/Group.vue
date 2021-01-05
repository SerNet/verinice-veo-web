<template>
  <div
    v-if="visible"
    class="vf-layout vf-group d-flex"
    :class="dynamicClasses"
    :style="options && options.style"
  >
    <div v-if="options && options.label" class="text-subtitle-1 mb-2">
      {{ options.label }}
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  Helpful,
  LayoutProps
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'Group',
  props: {
    options: Object,
    disabled: Boolean,
    visible: Boolean
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
      return [
        this.directionClass,
        this.options && this.options.class ? this.options.class : ''
      ]
    }
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [
        typeof props.options !== 'undefined' && props.options.format === 'group'
      ],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped>
.vf-layout.vf-group.border {
  border-radius: 5px !important;
  border: 1px dashed #cccccc;
  padding: 10px;
  margin: 8px 0;
}

.direction-vertical > .vf-control {
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
      margin-bottom: 12px !important;
    }
  }
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
      margin-top: 12px !important;
      margin-bottom: 12px !important;
    }
  }
}
</style>
