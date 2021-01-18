<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Group</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-row>
          <v-col cols="2">
            <v-switch
              v-model="direction"
              :label="`Direction: ${direction}`"
              hide-details
              color="primary"
              false-value="vertical"
              true-value="horizontal"
            />
          </v-col>
          <v-col cols="auto">
            <v-switch v-model="border" label="Border" hide-details color="primary" />
          </v-col>
          <v-col cols="2" class="ml-10">
            <v-text-field
              :value="groupTitle"
              label="Group title"
              hide-details
              clearable
              @input="onInputGroupTitle"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector">
        <VeoForm v-model="form.data" :schema="form.objectSchema" :ui="form.formSchema" />
      </v-col>
    </v-row>
    <FormDescription :object-schema="form.objectSchema" :form-schema="form.formSchema" :data="form.data" />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'
import vjp from 'vue-json-pointer'
import VeoForm from '~/components/forms/VeoForm.vue'
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'

export default Vue.extend({
  components: {
    VeoForm,
    FormDescription,
    PageHeader
  },
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            inputText: {
              type: 'string'
            },
            select: {
              type: 'string',
              enum: ['Beispiel-1', 'Beispiel-2', 'Beispiel-3']
            }
          }
        },
        formSchema: {
          type: 'Layout',
          options: {
            format: 'group'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/inputText',
              options: {
                label: 'Input Text'
              }
            },
            {
              type: 'Control',
              scope: '#/properties/select',
              options: {
                label: 'Select'
              }
            }
          ]
        },
        data: {
          inputText: 'Beispiel',
          select: 'Beispiel-1'
        }
      },
      direction: 'vertical',
      border: false,
      groupTitle: undefined
    }
  },
  watch: {
    direction: {
      immediate: true,
      handler() {
        this.update(this.form.formSchema, '/options/direction', this.direction)
      }
    },
    border: {
      immediate: true,
      handler() {
        if (this.border) {
          this.update(this.form.formSchema, '/options/class', 'border')
        } else {
          this.update(this.form.formSchema, '/options/class', undefined)
        }
      }
    }
  },
  methods: {
    update(object: any, jsonPointer: string, value: any): void {
      vjp.set(this.form.formSchema, jsonPointer, value)
      this.form.formSchema = { ...this.form.formSchema }
    },
    onInputGroupTitle(event: any) {
      this.groupTitle = event
      console.log(event)
      if (event) {
        this.update(this.form.formSchema, '/options/label', event)
      } else {
        this.update(this.form.formSchema, '/options/label', undefined)
      }
    }
  }
})
</script>

<style lang="scss"></style>
