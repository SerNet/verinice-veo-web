<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div
    v-if="visible"
    class="vf-markdown-editor vf-form-element"
    :class="{ 'is-disabled': disabled }"
  >
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <div
        v-if="options && options.label"
        class="subtitle-1"
      >
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
import Vue, { VueConstructor } from 'vue';
import { PropOptions } from 'vue/types/options';
import { JSONSchema7 } from 'json-schema';

import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import { Editor } from '@toast-ui/vue-editor';
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers';

// Outside of vue as the editor can't handle the function being part of the vue methods or computed properties.
function clearButton(instance: any) {
  const el = document.createElement('button');
  el.textContent = 'X';
  el.type = 'button';
  el.classList.add('codeblock');
  // @ts-ignore
  el.ariaLabel = 'Clear editor';
  el.addEventListener('click', () => {
    instance.$emit('clear-editor');
  });
  return el;
}

export default (Vue as VueConstructor<Vue & { $refs: { toastuiEditor: any } }>).extend({
  name: 'MarkdownEditor',
  props: {
    value: {
      type: String,
      default: undefined
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: undefined
    },
    validation: {
      type: Object,
      default: undefined
    },
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    editorOptions(): any {
      return {
        usageStatistics: false,
        plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]],
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          [
            'code',
            {
              el: clearButton(this),
              name: 'clear-button',
              tooltip: this.$t('clear')
            },
            'codeblock'
          ]
        ]
      };
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (this.$refs.toastuiEditor) {
          this.$refs.toastuiEditor.invoke('setMarkdown', value);
        }
      }
    }
  },
  mounted() {
    this.$on('clear-editor', () => {
      this.clear();
    });
  },
  methods: {
    clear() {
      this.$emit('input', undefined);
    },
    onChange() {
      const markdownText = this.invoke('getMarkdown');
      this.$emit('input', (typeof this.value === 'undefined' || this.value === null) && markdownText === '' ? this.value : markdownText);
    },
    invoke(tuiMethodName: string) {
      return this.$refs.toastuiEditor.invoke(tuiMethodName);
    }
  }
});

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'string', typeof props.options !== 'undefined' && props.options.format === 'markdown']);
  }
};
</script>

<i18n>
{
  "en": {
    "clear": "Clear content"
  },
  "de": {
    "clear": "Inhalt löschen"
  }
}  
</i18n>

<style lang="scss">
// Good resource how to include external .css as inline in scss
// https://github.com/sass/node-sass/issues/2362#issuecomment-388634848
// add node_modules/ to work with rollup and vue together
// https://github.com/vuejs/rollup-plugin-vue/issues/146#issuecomment-363749613
.vf-markdown-editor {
  position: relative;
  z-index: 0;

  @import 'node_modules/@toast-ui/editor/dist/toastui-editor';
  @import 'prismjs/themes/prism';
  @import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight';
  .toastui-editor-contents h1,
  .toastui-editor-contents h2,
  .toastui-editor-contents h3,
  .toastui-editor-contents h4,
  .toastui-editor-contents h5,
  .toastui-editor-contents h6 {
    border: none;
  }
  .toastui-editor-toolbar-item-wrapper {
    margin: 0;
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
    .toastui-editor-defaultUI::before {
      content: '';
      width: 100%;
      background: rgba(255, 255, 255, 0.7);
      height: 100%;
      position: absolute;
      z-index: 101;
    }
  }
}
</style>
