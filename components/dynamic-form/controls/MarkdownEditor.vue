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
    <div ref="editor" />
  </div>
</template>

<script lang="ts">
import { IVeoFormsElementDefinition } from '../types';

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
</script>

<script setup lang="ts">
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import { last } from 'lodash';
import Prism from 'prismjs';

import { Editor } from '@toast-ui/editor';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

import { VeoFormsControlProps } from '../util';

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
let localViewer: any = null;

defineOptions({
  name: CONTROL_DEFINITION.code
});

const props = defineProps(VeoFormsControlProps);
const emit = defineEmits<{
  'update:model-value': [value: string | undefined];
}>();

const { t } = useI18n();
const editor = ref();

const cleanup = () => {
  if (localEditor) {
    localEditor.destroy();
    localEditor = null;
  }
  if (localViewer) {
    localViewer.destroy();
    localViewer = null;
  }
};

// Initialize editor or viewer based on disabled state
const initializeComponent = () => {
  if (!editor.value) return;

  cleanup(); // Clean up existing instances

  const isDisabled = props.options.disabled || props.disabled;
  let firstFocus = true;

  if (isDisabled) {
    // Render HTML in read-only mode using Viewer
    localViewer = new Viewer({
      el: editor.value,
      initialValue: props.modelValue ?? '',
      usageStatistics: false,
      plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]]
    });
  } else {
    // Create editable markdown editor
    localEditor = new Editor({
      el: editor.value,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      autofocus: false,
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
      ],
      events: {
        focus: () => {
          if (firstFocus) {
            nextTick(() => {
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
      }
    });

    // Set initial content for editor
    if (props.modelValue !== undefined) {
      localEditor.setMarkdown(props.modelValue);
    }
  }
};

// Watch for content changes
watch(
  () => [props.modelValue, editor.value],
  () => {
    initializeComponent();
  }
);

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<i18n src="~/locales/base/components/dynamic-form-controls-markdown-editor.json"></i18n>

<style lang="scss">
.vf-markdown-editor {
  position: relative;
  z-index: 0;
  @import '@toast-ui/editor/dist/toastui-editor';
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
