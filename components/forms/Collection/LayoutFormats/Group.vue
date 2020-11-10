<template>
  <div
    v-if="visible"
    class="vf-layout vf-group d-flex mx-auto"
    :class="dynamicClasses"
    style="max-width: 800px; width: 100%;"
    :style="options && options.style"
  >
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
    highlightClass() {
      if (this.options && this.options.highlight === false) {
        return 'no-highlight'
      } else {
        return 'highlight'
      }
    },
    dynamicClasses(): string[] {
      return [
        this.directionClass,
        this.highlightClass,
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
.vf-layout.vf-group.highlight {
  border-radius: 5px !important;
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12) !important;
  padding: 10px;
}

.vf-layout.vf-group.highlight + .vf-layout.vf-group.highlight {
  margin-top: 16px;
}

.vf-layout.vf-group.no-highlight {
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
    }

    & > .vf-array-field,
    & > .vf-checkbox,
    & > .vf-links-field,
    & > .vf-radio {
      margin-top: 12px !important;
    }
  }
}
</style>
