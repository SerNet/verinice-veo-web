<template>
  <div class="fill-height d-flex flex-column" style="width: 100%;">
    <div style="flex-grow: 1; overflow: auto;">
      <div class="editor" :style="{ resize: 'vertical', width: '100%' }">
        <div
          ref="editor"
          style="height: 100%"
          @keydown.meta.enter="$emit('submit', $event)"
          @keydown.exact="codeModified()"
        />
      </div>
    </div>
    <div v-if="!readonly" class="veo-editor-save-button">
      <v-btn class="mx-4 my-2" color="primary" outlined :disabled="saveButtonDisabled" @click="updateSchema()">
        {{ $t('editor.editor.button.save') }}
      </v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { EditorState, EditorView, basicSetup } from '@codemirror/next/basic-setup'
import { keymap, highlightSpecialChars, indentOnInput } from '@codemirror/next/view'
import { startCompletion, autocompletion, completionKeymap } from '@codemirror/next/autocomplete'
import { json } from '@codemirror/next/lang-json'
import { setDiagnostics, lintKeymap } from '@codemirror/next/lint'
import { TransactionSpec, tagExtension, StateField, EditorSelection } from '@codemirror/next/state'

import { history, historyKeymap } from '@codemirror/next/history'
import { foldGutter, foldKeymap } from '@codemirror/next/fold'
import { lineNumbers } from '@codemirror/next/gutter'
import { defaultKeymap } from '@codemirror/next/commands'
import { bracketMatching } from '@codemirror/next/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/next/closebrackets'
import { searchKeymap } from '@codemirror/next/search'

import { commentKeymap } from '@codemirror/next/comment'
import { rectangularSelection } from '@codemirror/next/rectangular-selection'
import { gotoLineKeymap } from '@codemirror/next/goto-line'
import { highlightSelectionMatches } from '@codemirror/next/highlight-selection'
import { defaultHighlighter } from '@codemirror/next/highlight'
import { defineComponent, onMounted, ref, watchEffect } from '@nuxtjs/composition-api'
import { VeoEvents } from '~/types/VeoGlobalEvents'

const languageTag = Symbol('language')

export interface CodeError extends Error {
  position?: number
  severity?: string
}

interface Props {
  value: string
  wordwrap?: boolean
  language: typeof basicSetup | false
  error?: CodeError
  readonly: boolean
}

export const SELECTION_CHAR = '\uD813'

export default defineComponent<Props>({
  props: {
    value: { type: String, default: '' },
    wordwrap: { type: Boolean, default: false },
    language: { type: [Array, Boolean, Object], default: () => json() },
    error: { type: Object, default: undefined },
    readonly: { type: Boolean, default: false }
  },
  setup(props, context) {
    const editorRef = ref<HTMLDivElement>(null as any)
    let $editor: EditorView

    function setLanguage(v: typeof basicSetup | false): TransactionSpec | undefined {
      if (!$editor) {
        return
      }
      return {
        reconfigure: {
          [languageTag]: v || []
        }
      }
    }

    const toDiagnostic = (e: CodeError) => {
      const from = 'position' in e ? Number(e.position) - 1 : -1
      const to =
        from === -1
          ? $editor.state.doc.toString().length
          : from + $editor.state.doc.sliceString(from).split(/\s+/)[0].length
      const severity = ('severity' in e ? String(e.severity).toLowerCase() : 'error') as any
      const message = e.message

      return { from: Math.max(0, from), to, severity, message }
    }

    function setError(e: CodeError | undefined) {
      if (!$editor) {
        return
      }
      try {
        const tr = setDiagnostics($editor.state, e ? [toDiagnostic(e)] : [])
        return tr as TransactionSpec
      } catch (e) {
        return undefined
      }
    }

    function setText(value: string, force: boolean = false) {
      if (force || $editor.state.doc.toString() !== value) {
        const regex = new RegExp(SELECTION_CHAR, 'g')
        const text = value.replace(regex, (...args) => {
          return ''
        })

        const selectionMarks = [...value.matchAll(regex)]
        const selections = selectionMarks.reduce(
          (out, v, i, list) => {
            if (i % 2 === 1) {
              return out.concat(EditorSelection.range((list[i - 1]?.index || 0) - i + 1, (v.index || 0) - i))
            }
            return out
          },
          [EditorSelection.cursor(Math.max((selectionMarks[1]?.index || 0) - 1), 0)]
        )

        const selection = selectionMarks.length ? EditorSelection.create(selections) : undefined
        const transaction = {
          changes: { from: 0, insert: text, to: $editor.state.doc.length },
          selection
        }
        return transaction as TransactionSpec
      }
    }

    const saveButtonDisabled = ref(true)
    function codeModified() {
      saveButtonDisabled.value = false
    }

    function updateSchema() {
      if (!props.readonly) {
        try {
          const updatedSchema = JSON.parse($editor.state.toJSON().doc)
          context.emit('schema-updated', updatedSchema)
          context.root.$emit(VeoEvents.SNACKBAR_SUCCESS, context.root.$i18n.t('editor.code.save.success'))
        } catch (e) {
          context.root.$emit(VeoEvents.ALERT_ERROR, {
            title: context.root.$i18n.t('editor.code.save.error'),
            text: e
          })
        }
      }
      saveButtonDisabled.value = true
    }

    onMounted(() => {
      const updateExtension = StateField.define({
        create() {
          return 0
        },
        update(value: any, tr) {
          if (tr.docChanged) {
            context.emit('update:error', undefined)
            // context.emit('input', tr.state.doc.toString())
          }
          return tr.docChanged ? value : value
        }
      })

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
      }))

      watchEffect(() => {
        try {
          const transactions = [setText(props.value), setLanguage(props.language)].filter(_ => !!_) as TransactionSpec[]

          $editor.dispatch(...transactions)
          // const err = setError(props.error)
          // err && $editor.dispatch(err)
        } catch (e) {}
      })

      setText(props.value)
      // setError(props.error)

      // Registering event hooks
      $editor.dom.onpaste = () => {
        codeModified()
      }

      $editor.dom.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'z') {
          codeModified()
        }
      })
    })

    return {
      editor: editorRef,
      update() {
        // Update text to trigger resize
        try {
          const t = setText(props.value, true)
          if (t) {
            $editor.dispatch(t)
          }
        } catch (e) {}
      },
      focus() {
        context.root.$nextTick(() => {
          $editor.focus()
        })
      },
      codeModified,
      saveButtonDisabled,
      updateSchema
    }
  }
})
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
  ::v-deep .cm-focused {
    outline: none !important;
  }
}

.veo-editor-save-button {
  background-color: rgb(245, 245, 245);
  flex-grow: 0;
}

/*
 * Super ugly fix for resizes in a v-dialog, as codeMirror next has no refresh
 * event we could use to make the gutters as big as they should be.
 */
::v-deep .cm-gutter-lineNumber {
  min-height: 150px;
}

::v-deep .cm-gutterElement-lineNumber:not(:first-child) {
  min-height: 18px;
}
</style>
