<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
    v-if="options.visible"
    class="vf-markdown-editor vf-form-element"
    :class="{ 'is-disabled': disabled || options.disabled }"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
  >
    <div v-if="options.label" class="subtitle-1">
      {{ options.label }}
    </div>
    <div v-if="!options.disabled" ref="editor" />
    <div class="no-editor-html-output" v-else v-html="modelValue" />
  </div>
</template>

<script lang="ts">
import { last } from 'lodash';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import Editor from '@toast-ui/editor';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { onMounted } from 'vue';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-markdown-editor',
  name: {
    en: 'markdown editor',
    de: 'Markdown editor'
  },
  description: {
    en: 'WYSIWYG markdown editor to style input.',
    de: 'WYSIWYG Markdown editor um Eingaben zu formatieren.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'string',
    typeof props.options !== 'undefined' && props.options.format === 'markdown'
  ]
};

// Outside of vue as the editor can't handle the function being part of the vue methods or computed properties.
function clearButton(callback: CallableFunction) {
  const el = document.createElement('button');
  el.textContent = 'X';
  el.type = 'button';
  el.className = 'toastui-editor-toolbar-icons last';
  el.style.backgroundImage = 'none';
  el.ariaLabel = 'Clear editor';
  el.addEventListener('click', () => {
    callback();
  });
  return el;
}

let localEditor: any = null;

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const editor = ref();

    const onCreated = () => {
      if (editor.value) {
        localEditor.setMarkdown(props.modelValue);
      }
    };

    watch(() => props.modelValue, onCreated, { immediate: true });
    watch(() => editor.value, onCreated, { immediate: true });

    onMounted(() => {
      if (props.options.disabled) return;
      let firstFocus = true;

      localEditor = new Editor({
        el: editor.value,
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        autofocus: false, // For some reason this config is buggy, workaround in `events`, cp. https://github.com/nhn/tui.editor/issues/1802
        events: {
          focus: () => {
            if (firstFocus) {
              nextTick(() => {
                // Focus name control and not the editor (cp. above)
                localEditor.blur();
                document.querySelector<HTMLElement>('[data-component-name="object-form-form"]')?.scrollTo(0, 0);
                firstFocus = false;
              });
            }
          },
          change: () => {
            const markdownText = localEditor.getMarkdown();
            emit(
              'update:model-value',
              (typeof props.modelValue === 'undefined' || props.modelValue === null) && markdownText === '' ?
                props.modelValue
              : markdownText
            );
          }
        },
        usageStatistics: false,
        plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]],
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          [
            {
              el: clearButton(() => emit('update:model-value', undefined)),
              command: 'clear-button',
              name: 'clear-button',
              tooltip: t('clear')
            }
          ]
        ]
      });
    });

    return {
      editor,

      getControlErrorMessages,
      last
    };
  }
});
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

// Minimal makeshift styling, non editor output
.no-editor-html-output {
  margin-top: 16px;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 120%;
  }
}

.no-editor-html-output * + * {
  margin-top: 16px;
}
.no-editor-html-output * + *:not(h1, h2, h3, h4, h5, h6) {
  margin-top: 8px;
}
</style>
