<template>
  <v-col class="pa-0 fill-height overflow-hidden" style="max-height: calc(100vh - 70px);" cols="12">
    <v-row v-if="schema" class="fill-height ma-0">
      <v-col class="pa-0" :style="{ maxHeight }" style="overflow: auto; position: relative;" cols="12" :lg="collapsed ? 12 : 6">
        <div class="veo-collapse-editor pa-1">
          <v-btn icon @click="collapsed = !collapsed">
            <v-icon v-if="collapsed">mdi-chevron-left</v-icon>
            <v-icon v-else>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <v-row no-gutters class="flex-column align-center">
          <v-col :cols="collapsed ? 8 : 12">
            <h1 class="ml-4 mt-2">Objektschema Editor</h1>
          </v-col>
          <v-col :cols="collapsed ? 8 : 12">
            <ObjectSchemaEditor v-model="schema" @schema-updated="updateSchema" />
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="!collapsed" class="pa-0 fill-height" :style="{ maxHeight }" cols="12" lg="6">
        <CodeEditor v-model="code" @schema-updated="updateSchema" />
      </v-col>
    </v-row>
    <VeoDialog v-else v-model="showCreationDialog" large :headline="$t('editor.objectschema.create.headline')" close-hidden>
      <template #default>
        <v-form v-model="createForm.valid">
          <v-row no-guters class="align-center mt-6">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;">{{ $t('editor.objectschema.create.type.text') }}:</span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-select v-model="createForm.type" :label="$t('editor.objectschema.create.type')" :items="objectTypes" :rules="createForm.rules.type" required />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mt-6">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;">{{ $t('editor.objectschema.create.description.text') }}:</span>
            </v-col>
            <v-col :cols="12" :md="5">
              <v-text-field v-model="createForm.description" :label="$t('editor.objectschema.create.description')" :rules="createForm.rules.description" required />
            </v-col>
          </v-row>
        </v-form>
      </template>
      <template #dialog-options>
        <v-spacer />
        <v-btn color="primary" :disabled="!createForm.valid" @click="createSchema()">
          {{ $t('global.button.next') }}
        </v-btn>
      </template>
    </VeoDialog>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { trim } from 'lodash'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'

import { generateSchema } from '~/lib/ObjectSchemaHelper'
import { ObjectSchemaNames } from '~/types/FormSchema'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'

export default Vue.extend({
  components: {
    VeoDialog
  },
  data() {
    return {
      collapsed: false as boolean,
      showCreationDialog: false as boolean,
      tab: 'form-schema',
      schema: undefined as VEOObjectSchemaRAW | undefined,
      createForm: {
        type: '' as string,
        description: '' as string,
        valid: false,
        rules: {
          type: [(input: string) => trim(input).length > 0],
          description: [(input: string) => trim(input).length > 0]
        }
      }
    }
  },
  computed: {
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px)'
    },
    objectTypes(): {text: string, value: string}[] { // Generate an array containing all object types as defined in the ObjectSchemaNames enum.
      return Object.keys(ObjectSchemaNames).map((value: string) => {
        return {
          text: this.$t(`unit.data.type.${value}`) as string,
          value
        }
      })
    },
    code: {
      get(): string {
        return this.schema ? JSON.stringify(this.schema, undefined, 2) : ''
      },
      set(v: string) {
        try {
          this.schema = JSON.parse(v)
        } catch (e) {}
      }
    }
  },
  mounted() {
    this.showCreationDialog = this.schema === undefined
  },
  methods: {
    updateSchema(schema: VEOObjectSchemaRAW) {
      this.schema = undefined // We have to set it to undefined first, else the editor won't pick up the change.
      this.schema = schema
    },
    createSchema() {
      this.schema = generateSchema(this.createForm.type, this.createForm.description)
    }
  }
})
</script>

<style lang="scss" scoped>
.veo-collapse-editor {
  background-color: rgb(245, 245, 245);
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  position: absolute;
  right: 0;
}
</style>
