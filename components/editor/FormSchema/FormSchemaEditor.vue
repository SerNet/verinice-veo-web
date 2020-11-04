<template>
  <div>
    <v-row>
      <v-col>
        <div class="mx-5 my-4" style="max-width:800px;">
          <v-select :items="items" v-model="layout" label="Layout Style" style="width:200px;"></v-select>
          <VeoForm v-model="objectData" :schema="objectSchema" :ui="formSchema" :is-valid.sync="isValid" :error-messages.sync="errorMessages" /></div
      ></v-col>
      <v-col>
        <div style="max-width:500px;">
          <pre>{{ JSON.stringify(formSchema, null, 2) }}</pre>
        </div>
      </v-col>
    </v-row>

    <!-- <draggable v-model="myArray" group="people" @start="drag = true" @end="drag = false">
      <div v-for="element in myArray" :key="element.id">{{ element.name }}</div>
    </draggable> -->
    <div>
      <v-row>
        <v-col>
          <nested-draggable :tasks="list" :level="level" />
        </v-col>
        <v-col>
          <pre>{{ JSON.stringify(list, null, 2) }}</pre>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import draggable from 'vuedraggable'
import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import VeoForm from '~/components/editor/FormSchema/forms/VeoForm.vue'

export default Vue.extend({
  name: 'FormSchemaEditor',
  components: {
    // draggable
    NestedDraggable,
    VeoForm
  },
  props: {
    objectSchema: Object
  },
  data() {
    return {
      level: 1,
      list: [
        {
          name: 'task 1',
          tasks: [
            {
              name: 'task 2',
              tasks: []
            }
          ]
        },
        {
          name: 'task 3',
          tasks: [
            {
              name: 'task 4',
              tasks: []
            }
          ]
        },
        {
          name: 'task 5',
          tasks: []
        }
      ],
      myArray: [{ name: 'Hallo 1' }, { name: 'Hallo 2' }, { name: 'Hallo 3' }, { name: 'Hallo 4' }],
      layout: 'long',
      items: [
        {
          text: 'Durchgehend',
          value: 'long'
        },
        {
          text: 'Seiten',
          value: 'page'
        }
      ],
      objectData: {},
      isValid: undefined,
      errorMessages: undefined,
      formSchema: {
        type: 'Layout',
        options: {
          direction: 'vertical',
          format: 'group'
        },
        elements: [
          {
            type: 'Control',
            scope: '#/properties/abbreviation',
            options: {
              label: 'abbreviation'
            }
          },
          {
            type: 'Control',
            scope: '#/properties/description',
            options: {
              label: 'description'
            }
          },
          {
            type: 'Control',
            scope: '#/properties/name',
            options: {
              label: 'name'
            }
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_SensitiveData',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_SensitiveData/properties/attributes/properties/process_SensitiveData_SensitiveData',
                options: {
                  label: 'process_SensitiveData_SensitiveData'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_SensitiveData/properties/attributes/properties/process_SensitiveData_comment',
                options: {
                  label: 'process_SensitiveData_comment'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_SensitiveData/properties/attributes/properties/process_SensitiveData_notification3343GDPR',
                options: {
                  label: 'process_SensitiveData_notification3343GDPR'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_SensitiveData/properties/attributes/properties/process_SensitiveData_secrecy203STGB',
                options: {
                  label: 'process_SensitiveData_secrecy203STGB'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_GeneralInformation',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_GeneralInformation/properties/attributes/properties/process_GeneralInformation_tags',
                options: {
                  label: 'process_GeneralInformation_tags'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_GeneralInformation/properties/attributes/properties/process_GeneralInformation_document',
                options: {
                  label: 'process_GeneralInformation_document'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_AccessAuthorization',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_AccessAuthorization/properties/attributes/properties/process_AccessAuthorization_authorizationConcept',
                options: {
                  label: 'process_AccessAuthorization_authorizationConcept'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_AccessAuthorization/properties/attributes/properties/process_AccessAuthorization_description',
                options: {
                  label: 'process_AccessAuthorization_description'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_AccessAuthorization/properties/attributes/properties/process_AccessAuthorization_Document',
                options: {
                  label: 'process_AccessAuthorization_Document'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_InternalRecipient',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_InternalRecipient/properties/attributes/properties/process_InternalRecipient_InternalRecipient',
                options: {
                  label: 'process_InternalRecipient_InternalRecipient'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_ProcessingDetails',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ProcessingDetails/properties/attributes/properties/process_ProcessingDetails_intendedPurpose',
                options: {
                  label: 'process_ProcessingDetails_intendedPurpose'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ProcessingDetails/properties/attributes/properties/process_ProcessingDetails_typeOfSurvey',
                options: {
                  label: 'process_ProcessingDetails_typeOfSurvey'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ProcessingDetails/properties/attributes/properties/process_ProcessingDetails_operationalStage',
                options: {
                  label: 'process_ProcessingDetails_operationalStage'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ProcessingDetails/properties/attributes/properties/process_ProcessingDetails_comment',
                options: {
                  label: 'process_ProcessingDetails_comment'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ProcessingDetails/properties/attributes/properties/process_ProcessingDetails_surveyConductedOn',
                options: {
                  label: 'process_ProcessingDetails_surveyConductedOn'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_InformationObligations',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope:
                  '#/properties/customAspects/properties/process_InformationObligations/properties/attributes/properties/process_InformationObligations_informationObligations',
                options: {
                  label: 'process_InformationObligations_informationObligations'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_InformationObligations/properties/attributes/properties/process_InformationObligations_explanation',
                options: {
                  label: 'process_InformationObligations_explanation'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_InformationObligations/properties/attributes/properties/process_InformationObligations_document',
                options: {
                  label: 'process_InformationObligations_document'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_ExternalRecipient',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_ExternalRecipient/properties/attributes/properties/process_ExternalRecipient_ExternalRecipient',
                options: {
                  label: 'process_ExternalRecipient_ExternalRecipient'
                }
              }
            ]
          },
          {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              class: 'elevation-5 my-2',
              style: 'border-radius: 5px'
            },
            elements: [
              {
                type: 'Label',
                text: 'process_JointControllership',
                options: {
                  class: 'display',
                  style: 'color: #8c8c8c'
                }
              },
              {
                type: 'Control',
                scope: '#/properties/customAspects/properties/process_JointControllership/properties/attributes/properties/process_JointControllership_jointResponsiblePersons',
                options: {
                  label: 'process_JointControllership_jointResponsiblePersons'
                }
              }
            ]
          }
        ]
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
