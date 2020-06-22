<template>
  <div>
    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <veo-form v-model="form.value" :schema="form.objectSchema" :ui="form.formSchema" />
      </div>
    </div>

    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="mx-auto" style="width:800px">
          <v-expansion-panels v-model="panel">
            <v-expansion-panel>
              <v-expansion-panel-header>Generated Data</v-expansion-panel-header>
              <v-expansion-panel-content>
                <code>
                  <pre>{{ JSON.stringify(form.value, null, 4) }}</pre>
                </code>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </div>

    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="mx-auto" style="width:800px">
          <v-btn color="primary" block @click="create">Objekt erstellen</v-btn>
          <div v-if="createdObjectURL">
            <br>Bearbeitungs Link für das Objekt:<br>
            {{ createdObjectURL }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import JsonPointer from 'json-ptr'

// const preprocessSchemaForTranslation = (schema: any) => {
//   schema.$schema = 'http://json-schema.org/draft-07/schema#'
//   JsonPointer.list(schema, '#')
//     .filter((obj: any) => /\/(?<!type\/)enum\/\d+$/gi.test(obj.fragmentId))
//     .forEach((obj: any) => {
//       JsonPointer.set(schema, obj.fragmentId, `#lang/${obj.value}`)
//     })
//   return schema
// }

export default Vue.extend({
  name: 'Forms',
  async asyncData(context) {
    // const objectSchema = preprocessSchemaForTranslation(await context.app.$api.schema.fetch('process'))
    // // const translation = await context.app.$api.translation.fetch(['de', 'en'])
    // const formSchema = await require(`./${context.route.params.form}.json`)
    // const translation = await require('./../Translations.json')
    // return { objectSchema, formSchema, lang: translation.lang }
  },
  data() {
    return {
      panel: true,
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            owner: {
              type: 'object',
              properties: {
                displayName: {
                  type: 'string',
                  description: 'A friendly human readable title of the referenced unit.'
                },
                href: {
                  type: 'string',
                  description: 'The resource URL of the referenced unit.'
                }
              },
              required: ['displayName', 'href'],
              description: 'A reference to the unit containing this entity.'
            }
          }
        },
        formSchema: {
          type: 'Layout',
          options: {
            direction: 'vertical',
            format: 'group'
          },
          elements: [
            {
              type: 'Label',
              text: 'Formular für die Objekterstellung',
              options: {
                class: 'display-1'
              }
            },
            {
              type: 'Control',
              scope: '#/properties/name',
              options: {
                label: 'Name'
              }
            }
          ]
        },
        value: {
          owner: { href: '/units/fe255b98-443a-4bd3-8f8e-14af258b21a8' }
        }
      },
      createdObjectUUID: ''
    }
  },
  computed: {
    createdObjectURL(): string {
      return this.createdObjectUUID ? `${window.location}${this.createdObjectUUID}` : ''
    }
  },
  methods: {
    async create() {
      const res = await this.$api.process.create(this.form.value)
      this.createdObjectUUID = res.resourceId
    }
  },
  head() {
    return {
      title: 'Form'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 20px;
  width: 100%;
}
</style>
