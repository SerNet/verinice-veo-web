<template>
  <div class="vf-markdown-editor" :class="{ 'is-disabled': disabled }">
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <div v-if="options && options.label" class="subtitle-1">
        {{ options && options.label }}
      </div>
      <editor
        v-if="visible"
        ref="toastuiEditor"
        :initial-value="value"
        :options="editorOptions"
        :error-messages="errors[0]"
        :class="options && options.class"
        :style="options && options.style"
        @change="onChange"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'

import hljs from 'highlight.js'
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight'
import { Editor } from '@toast-ui/vue-editor'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/editor/FormSchema/forms/Collection/utils/helpers.ts'
import { BaseObject, IApi } from '~/components/editor/FormSchema/forms/utils'

export default (Vue as VueConstructor<
  Vue & { $refs: { toastuiEditor: any } }
>).extend({
  name: 'MarkdownEditor',
  components: {
    editor: Editor
  },
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: {},
    validation: Object,
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
  },
  data() {
    return {
      editorOptions: {
        usageStatistics: false,
        plugins: [[codeSyntaxHighlightPlugin, { hljs }]],
        toolbarItems: [
          'heading',
          'bold',
          'italic',
          'strike',
          'divider',
          'hr',
          'quote',
          'divider',
          'ul',
          'ol',
          'task',
          'indent',
          'outdent',
          'divider',
          'table',
          'image',
          'link',
          'divider',
          'code',
          'codeblock',
          'divider',
          {
            type: 'button',
            options: {
              className: 'tui-custom-clear',
              event: 'clearValue',
              tooltip: 'Clear Button',
              text: 'X',
              style:
                'background:none;font-weight:900;color: black;font-size: 14px;line-height: 1;'
            }
          }
        ]
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (this.$refs.toastuiEditor) {
          this.$refs.toastuiEditor.invoke('setMarkdown', value)
        }
      }
    }
  },
  mounted() {
    const eventManager = this.$refs.toastuiEditor.editor.eventManager
    eventManager.addEventType('clearValue')
    eventManager.listen('clearValue', this.clear)
  },
  methods: {
    clear() {
      this.$emit('input', undefined)
    },
    onChange(event: any) {
      const markdownText = this.invoke('getMarkdown')
      this.$emit(
        'input',
        (typeof this.value === 'undefined' || this.value === null) &&
          markdownText === ''
          ? this.value
          : markdownText
      )
    },
    invoke(tuiMethodName: string) {
      return this.$refs.toastuiEditor.invoke(tuiMethodName)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      typeof props.options !== 'undefined' &&
        props.options.format === 'markdown'
    ])
  }
}
</script>

<style lang="scss">
// Good resource how to include external .css as inline in scss
// https://github.com/sass/node-sass/issues/2362#issuecomment-388634848
// add node_modules/ to work with rollup and vue together
// https://github.com/vuejs/rollup-plugin-vue/issues/146#issuecomment-363749613
.vf-markdown-editor {
  @import 'node_modules/codemirror/lib/codemirror';
  @import 'node_modules/@toast-ui/editor/dist/toastui-editor';
  @import 'node_modules/highlight.js/styles/github';
  .tui-editor-contents h1,
  .tui-editor-contents h2,
  .tui-editor-contents h3,
  .tui-editor-contents h4,
  .tui-editor-contents h5,
  .tui-editor-contents h6 {
    border: none;
  }
  .tui-editor-defaultUI {
    background-color: #fff;
  }
  code::before,
  code::after {
    content: none;
  }
  code {
    box-shadow: none;
    background: none;
    font-weight: 400;
    font-size: 100%;
  }
  &.is-disabled {
    .tui-editor-defaultUI::before {
      content: '';
      width: 100%;
      background: rgba(255, 255, 255, 0.7);
      height: 100%;
      position: absolute;
      z-index: 3;
    }
  }
}
</style>
