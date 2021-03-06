<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Links Field</PageHeader>
      </v-col>
      <v-col cols="12">
        <v-switch v-model="isVertical" label="Vertical" hide-details color="primary" />
      </v-col>
      <v-col cols="auto" class="docs-form-sector">
        <VeoForm
          v-model="dynamicForm.data"
          :schema="dynamicForm.objectSchema"
          :ui="dynamicForm.formSchema"
          :general-translation="dynamicForm.lang[activeLanguage]"
          :api="api"
        />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="dynamicForm.objectSchema"
      :form-schema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'
import VeoForm from '~/components/forms/VeoForm.vue'
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'
import {
  BaseObject,
  IApi,
  ILinksFieldDialogNewObject,
  ILinksFieldDialogUpdatedObject,
  ISearchParams
} from '~/components/forms/utils'

export default Vue.extend({
  components: {
    VeoForm,
    FormDescription,
    PageHeader
  },
  data() {
    return {
      activeLanguage: 'de',
      items: [
        {
          // displayName: 'Kirsten Putzig',
          name: 'Kirsten Putzig',
          abbreviation: 'KP',
          description: 'Beschreibung von Kirsten Putzig',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: 'a1465716-8e0e-49fa-a545-b374bda9ae24',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Reinhold Fach',
          name: 'Reinhold Fach',
          abbreviation: 'RF',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '6ed33930-86d8-4c1e-8a42-51e796c2c357',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Timm Sundermann',
          name: 'Timm Sundermann',
          description: 'Beschreibung von Timm Sundermann',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: 'd9139dda-96e2-444a-82ea-5a1ce40dabce',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Ann-Kathrin Kurt',
          name: 'Ann-Kathrin Kurt',
          abbreviation: 'AKK',
          description: 'Beschreibung von Ann-Kathrin Kurt',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '1d1a2446-6d50-49cd-a520-86448ad546b7',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Paula Drewes',
          name: 'Paula Drewes',
          abbreviation: 'PD',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '8de73fca-157a-45d9-95cb-19205034f872',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Sascha Rosenbauer',
          name: 'Sascha Rosenbauer',
          description: 'Beschreibung von Sascha Rosenbauer',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '7f795e7b-b8f8-448c-bdb0-b1d761c79bdf',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Petra Maibaum',
          name: 'Petra Maibaum',
          abbreviation: 'PM',
          description: 'Beschreibung von Petra Maibaum',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '484c6e7f-c3e2-40b4-ba42-231e4c30881c',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        },
        {
          // displayName: 'Chris Ritz',
          name: 'Chris Ritz',
          domains: [],
          owner: {
            targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
          },
          links: {},
          customAspects: {},
          id: '58edc34b-6a9a-47fc-a869-e42eb24db608',
          references: [
            {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            }
          ]
        }
      ],
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            links: {
              type: 'object',
              properties: {
                process_ResponsibleDepartment: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        title: 'The UUID to identify the element',
                        format: 'regex',
                        pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
                      },
                      applicableTo: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      type: {
                        description: 'The name of the type described by this schema.',
                        enum: ['process_ResponsibleDepartment']
                      },
                      domains: {
                        type: 'array',
                        title: 'The list of domains in which this element is present.',
                        description: 'The ids of elements of the type domain.',
                        items: {
                          type: 'object',
                          properties: {
                            displayName: {
                              type: 'string',
                              description: 'A friendly human readable title of the referenced domain.'
                            },
                            targetUri: {
                              type: 'string',
                              description: 'The resource URL of the referenced domain.'
                            }
                          },
                          required: ['targetUri']
                        },
                        uniqueItems: true
                      },
                      references: {
                        type: 'array',
                        items: {
                          properties: {
                            displayName: {
                              type: 'string',
                              description: 'A friendly human readable title of the referenced object.'
                            },
                            targetUri: {
                              type: 'string',
                              description: 'The resource URL of the referenced object.'
                            }
                          },
                          required: ['targetUri']
                        }
                      },
                      abbreviation: {
                        type: 'string',
                        title: 'Abbreviation',
                        description: 'The abbreviation for this custom link.'
                      },
                      description: {
                        type: 'string',
                        title: 'Description',
                        description: 'The name for this custom link.'
                      },
                      name: {
                        type: 'string',
                        title: 'Name',
                        description: 'The name for this custom link.'
                      },
                      target: {
                        type: 'object',
                        title: 'id of the Person',
                        properties: {
                          targetUri: {
                            type: 'string',
                            title: 'The id of the target object.'
                          },
                          type: {
                            enum: ['Person']
                          }
                        }
                      },
                      attributes: {
                        type: 'object',
                        properties: {
                          testAttribute: {
                            type: 'string'
                          }
                        }
                      }
                    },
                    additionalProperties: false,
                    required: ['type', 'target']
                  }
                }
              }
            }
          }
        },
        formSchema: {
          type: 'Layout',
          options: {
            direction: 'vertical',
            format: 'group',
            highlight: false
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/links/properties/process_ResponsibleDepartment',
              options: {
                label: 'Verantwortlicher Fachbereich'
              },
              elements: [
                {
                  type: 'Control',
                  scope: '#/properties/attributes/properties/testAttribute',
                  options: {
                    label: 'Test Attribute'
                  }
                }
              ]
            }
          ]
        },
        lang: {
          de: {
            name: 'Name',
            abbreviation: 'Abkürzung',
            description: 'Beschreibung'
          },
          en: {
            name: 'Name',
            abbreviation: 'Abbreviation',
            description: 'Description'
          }
        },
        data: {
          links: {
            process_ResponsibleDepartment: [{}]
          }
        }
      },
      formVertical: {
        objectSchema: {
          type: 'object',
          properties: {
            links: {
              type: 'object',
              properties: {
                process_ResponsibleDepartment: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        title: 'The UUID to identify the element',
                        format: 'regex',
                        pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
                      },
                      applicableTo: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      type: {
                        description: 'The name of the type described by this schema.',
                        enum: ['process_ResponsibleDepartment']
                      },
                      domains: {
                        type: 'array',
                        title: 'The list of domains in which this element is present.',
                        description: 'The ids of elements of the type domain.',
                        items: {
                          type: 'object',
                          properties: {
                            displayName: {
                              type: 'string',
                              description: 'A friendly human readable title of the referenced domain.'
                            },
                            targetUri: {
                              type: 'string',
                              description: 'The resource URL of the referenced domain.'
                            }
                          },
                          required: ['targetUri']
                        },
                        uniqueItems: true
                      },
                      references: {
                        type: 'array',
                        items: {
                          properties: {
                            displayName: {
                              type: 'string',
                              description: 'A friendly human readable title of the referenced object.'
                            },
                            targetUri: {
                              type: 'string',
                              description: 'The resource URL of the referenced object.'
                            }
                          },
                          required: ['targetUri']
                        }
                      },
                      abbreviation: {
                        type: 'string',
                        title: 'Abbreviation',
                        description: 'The abbreviation for this custom link.'
                      },
                      description: {
                        type: 'string',
                        title: 'Description',
                        description: 'The name for this custom link.'
                      },
                      name: {
                        type: 'string',
                        title: 'Name',
                        description: 'The name for this custom link.'
                      },
                      target: {
                        type: 'object',
                        title: 'id of the Person',
                        properties: {
                          targetUri: {
                            type: 'string',
                            title: 'The id of the target object.'
                          },
                          type: {
                            enum: ['Person']
                          }
                        }
                      },
                      attributes: {
                        type: 'object',
                        properties: {
                          testAttribute: {
                            type: 'string'
                          }
                        }
                      }
                    },
                    additionalProperties: false,
                    required: ['type', 'target']
                  }
                }
              }
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/links/properties/process_ResponsibleDepartment',
          options: {
            direction: 'vertical',
            label: 'Verantwortlicher Fachbereich'
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/attributes/properties/testAttribute',
              options: {
                label: 'Test Attribute'
              }
            }
          ]
        },
        lang: {
          de: {
            name: 'Name',
            abbreviation: 'Abkürzung',
            description: 'Beschreibung'
          },
          en: {
            name: 'Name',
            abbreviation: 'Abbreviation',
            description: 'Description'
          }
        },
        data: {
          links: {
            process_ResponsibleDepartment: [{}]
          }
        }
      },
      isVertical: false
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.isVertical) {
        return this.formVertical
      }
      return this.form
    },
    api(): IApi {
      return {
        fetchAll: this.fetchAll,
        create: this.create,
        update: this.update,
        delete: this.delete
      }
    }
  },
  methods: {
    delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    async fetchAll(objectType: string, searchParams?: ISearchParams): Promise<BaseObject[]> {
      await this.delay(2000)
      return new Promise((resolve, reject) => {
        const res = searchParams
          ? this.items.filter((el: any) =>
              // TODO:change name with displayName after it is implemented
              // el.displayName.toLowerCase().includes(searchParams.displayName.toLowerCase()),
              el.name.toLowerCase().includes(searchParams.displayName.toLowerCase())
            )
          : this.items
        if (res) {
          resolve(res)
        } else {
          reject('Search parameters are not defined!')
        }
      })
    },
    async create(objectType: string, createdObjectData: ILinksFieldDialogNewObject): Promise<BaseObject> {
      await this.delay(2000)
      return new Promise((resolve, reject) => {
        if (createdObjectData.name) {
          const newItem = {
            displayName: createdObjectData.name,
            name: createdObjectData.name,
            abbreviation: createdObjectData.abbreviation,
            description: createdObjectData.description,
            domains: [],
            owner: {
              targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
            },
            links: {},
            customAspects: {},
            id: uuidv4(),
            references: [
              {
                targetUri: '/units/88bb6ff8-e1be-46ac-87fb-998cff1eac23'
              }
            ]
          }
          this.items.push(newItem)
          resolve(newItem)
        } else {
          reject('Name is not defined!')
        }
      })
    },
    async update(objectType: string, updatedObjectData: ILinksFieldDialogUpdatedObject): Promise<void> {
      await this.delay(2000)
      return new Promise((resolve, reject) => {
        if (updatedObjectData.name) {
          const itemIndex = this.items.findIndex(item => item.id === updatedObjectData.id)
          // TODO:uncomment the line below after displayName is implemented
          // updatedObjectData.displayName = updatedObjectData.name
          this.items[itemIndex] = updatedObjectData as any
          resolve()
        } else {
          reject('Name is not defined!')
        }
      })
    },
    async delete(objectType: string, id: string): Promise<void> {
      await this.delay(2000)
      return new Promise(resolve => {
        const itemIndex = this.items.findIndex(item => item.id === id)
        this.items.splice(itemIndex, 1)
        resolve()
      })
    }
  }
})
</script>

<style lang="scss"></style>
