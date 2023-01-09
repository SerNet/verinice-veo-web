<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
    class="fill-height fill-width d-flex flex-column"
    style="overflow: hidden;"
  >
    <div style="flex-grow: 1; overflow: auto;">
      <div
        class="editor"
        :style="{ resize: 'vertical', width: '100%' }"
      >
        <div
          ref="editor"
          style="height: 100%"
          @keyup="onChangedCode"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { EditorState, EditorView, basicSetup } from '@codemirror/next/basic-setup';
import { keymap, highlightSpecialChars, indentOnInput } from '@codemirror/next/view';
import { startCompletion, autocompletion, completionKeymap } from '@codemirror/next/autocomplete';
import { json } from '@codemirror/next/lang-json';
import { lintKeymap } from '@codemirror/next/lint';
import { TransactionSpec, tagExtension, StateField, EditorSelection, Extension } from '@codemirror/next/state';

import { history, historyKeymap } from '@codemirror/next/history';
import { foldGutter, foldKeymap } from '@codemirror/next/fold';
import { lineNumbers } from '@codemirror/next/gutter';
import { defaultKeymap } from '@codemirror/next/commands';
import { bracketMatching } from '@codemirror/next/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/next/closebrackets';
import { searchKeymap } from '@codemirror/next/search';

import { commentKeymap } from '@codemirror/next/comment';
import { rectangularSelection } from '@codemirror/next/rectangular-selection';
import { gotoLineKeymap } from '@codemirror/next/goto-line';
import { highlightSelectionMatches } from '@codemirror/next/highlight-selection';
import { defaultHighlighter } from '@codemirror/next/highlight';
import { PropType } from 'vue';

const languageTag = Symbol('language');

export interface CodeError extends Error {
  position?: number;
  severity?: string;
}

export const SELECTION_CHAR = '\uD813';

export default defineComponent({
  props: {
    value: { type: String, default: '' },
    wordwrap: { type: Boolean, default: false },
    language: { type: Array as PropType<Extension[]>, default: () => json() },
    error: { type: Object, default: undefined },
    readonly: { type: Boolean, default: false }
  },
  emits: ['update:error', 'input'],
  setup(props, context) {
    const editorRef = ref<HTMLDivElement>(null as any);
    let $editor: EditorView;

    function setLanguage(v: typeof basicSetup | false): TransactionSpec | undefined {
      if (!$editor) {
        return;
      }
      return {
        reconfigure: {
          [languageTag]: v || []
        }
      };
    }

    // const toDiagnostic = (e: CodeError) => {
    //   const from = 'position' in e ? Number(e.position) - 1 : -1;
    //   const to = from === -1 ? $editor.state.doc.toString().length : from + $editor.state.doc.sliceString(from).split(/\s+/)[0].length;
    //   const severity = ('severity' in e ? String(e.severity).toLowerCase() : 'error') as any;
    //   const message = e.message;

    //   return { from: Math.max(0, from), to, severity, message };
    // };

    // function setError(e: CodeError | undefined) {
    //   if (!$editor) {
    //     return;
    //   }
    //   try {
    //     const tr = setDiagnostics($editor.state, e ? [toDiagnostic(e)] : []);
    //     return tr as TransactionSpec;
    //   } catch (e) {
    //     return undefined;
    //   }
    // }

    function setText(value: string, force = false) {
      if (force || $editor.state.doc.toString() !== value) {
        const regex = new RegExp(SELECTION_CHAR, 'g');
        const text = value.replace(regex, '');

        const selectionMarks = [...value.matchAll(regex)];
        const selections = selectionMarks.reduce(
          (out, v, i, list) => {
            if (i % 2 === 1) {
              return out.concat(EditorSelection.range((list[i - 1]?.index || 0) - i + 1, (v.index || 0) - i));
            }
            return out;
          },
          [EditorSelection.cursor(Math.max((selectionMarks[1]?.index || 0) - 1), 0)]
        );

        const selection = selectionMarks.length ? EditorSelection.create(selections) : undefined;
        const transaction = {
          changes: { from: 0, insert: text, to: $editor.state.doc.length },
          selection
        };
        return transaction as TransactionSpec;
      }
    }

    onMounted(() => {
      const updateExtension = StateField.define({
        create() {
          return 0;
        },
        update(value: any, tr) {
          if (tr.docChanged) {
            context.emit('update:error', undefined);
            // context.emit('input', tr.state.doc.toString())
          }
          return tr.docChanged ? value : value;
        }
      });
      const editor: EditorView = ($editor = new EditorView({
        state: EditorState.create({
          doc: props.value,
          extensions: [
            [
              lineNumbers(),
              highlightSpecialChars(),
              history(),
              foldGutter(),
              indentOnInput(),
              defaultHighlighter,
              bracketMatching(),
              closeBrackets(),
              autocompletion(),
              rectangularSelection(),
              ...(props.wordwrap ? [EditorView.lineWrapping] : []),
              // highlightActiveLine(),
              highlightSelectionMatches(),
              keymap([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...commentKeymap,
                ...gotoLineKeymap,
                ...completionKeymap,
                ...lintKeymap
              ])
            ],
            keymap([{ key: 'Ctrl-Space', run: () => startCompletion(editor) }]),
            updateExtension,
            tagExtension(languageTag, props.language ? props.language : [])
          ]
        }),
        parent: editorRef.value
      }));

      // Make CodeEditor editable/non-editable
      watch(
        () => props.readonly,
        () => {
          editor.contentDOM.contentEditable = JSON.stringify(!props.readonly);
        },
        {
          immediate: true
        }
      );

      watchEffect(() => {
        try {
          const transactions = [setText(props.value), setLanguage(props.language)].filter((_) => !!_) as TransactionSpec[];

          $editor.dispatch(...transactions);
          // const err = setError(props.error)
          // err && $editor.dispatch(err)
        } catch (e) { /* empty */ }
      });

      setText(props.value);
      // setError(props.error)
    });

    function onChangedCode() {
      const editorText = $editor.state.toJSON().doc;
      if (editorText !== props.value) {
        context.emit('input', editorText);
      }
    }

    return {
      editor: editorRef,
      update() {
        // Update text to trigger resize
        try {
          const t = setText(props.value, true);
          if (t) {
            $editor.dispatch(t);
          }
        } catch (e) { /* empty */ }
      },
      focus() {
        nextTick(() => {
          $editor.focus();
        });
      },
      onChangedCode
    };
  }
});
</script>

<style lang="scss" scoped>
.editor {
  display: inline-block;
  font-size: 13px;
  height: 100%;
  margin: 0;
  padding: 0;
  padding-right: 2px;
  vertical-align: top;
}

.editor {
  :deep(.cm-focused) {
    outline: none !important;
  }
}

/*
 * Super ugly fix for resizes in a v-dialog, as codeMirror next has no refresh
 * event we could use to make the gutters as big as they should be.
 */
:deep(.cm-gutter-lineNumber) {
  min-height: 150px;
}

:deep(.cm-gutterElement-lineNumber:not(:first-child)) {
  min-height: 18px;
}
</style>
