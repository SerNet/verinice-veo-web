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
          <v-btn color="primary" :loading="state === 'loading'" block @click="create">Objekt erstellen</v-btn>
          <div v-if="createdObjectURL">
            <br>Bearbeitungs Link für das Objekt:<br>
            {{ createdObjectURL }}
          </div>
          <AppStateAlert v-model="state" state-after-alert="start" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IForm } from '@/lib/utils'
import AppStateAlert from '@/components/AppStateAlert.vue'

type ObjectSchemaName = 'asset' | 'control' | 'person' | 'process' | undefined

interface IData {
  panel: boolean
  form: IForm
  objectType: ObjectSchemaName
  createdObjectUUID: string
  unitUUID: string
  state: string
}

export default Vue.extend({
  name: 'Forms',
  components: {
    AppStateAlert
  },
  data(): IData {
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
        value: {}
      },
      objectType: undefined,
      createdObjectUUID: '',
      unitUUID: '',
      state: 'start'
    }
  },
  computed: {
    createdObjectURL(): string {
      return this.createdObjectUUID ? `${window.location.origin}/forms/${this.$route.params.form}/${this.createdObjectUUID}` : ''
    }
  },
  methods: {
    async create() {
      this.state = 'loading'
      try {
        await this.fetchUnit()
        if (!this.objectType) {
          const formSchema = await this.$api.form.fetch(this.$route.params.form)
          this.objectType = formSchema.modelType.toLowerCase()
        }
        if (this.objectType) {
          const res = await this.$api[this.objectType].create({
            ...this.form.value,
            owner: {
              href: `/units/${this.unitUUID}`
            }
          })
          this.createdObjectUUID = res.resourceId
          this.state = 'success'
        }
      } catch (error) {
        this.state = 'error'
      }
    },
    async fetchUnit() {
      try {
        const units = await this.$api.unit.fetchAll()
        if (Array.isArray(units) && units.length > 0) {
          // if unit exists, use the first unit
          this.unitUUID = units[0].id
        } else {
          // if units do not exist, create new one and use it
          const unit = await this.$api.unit.create({
            name: 'cpmsys test Unit'
          })
          this.unitUUID = unit.resourceId
        }
      } catch (error) {}
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
  padding: 0;
  width: 100%;
  display: block;
}
</style>
