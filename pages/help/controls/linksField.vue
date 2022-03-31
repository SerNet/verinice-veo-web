<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Markus Werner, Jonas Heitmann
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
  <VeoPage
    fullsize
    title="Links Field"
    fixed-header
  >
    <v-row justify="center">
      <v-col cols="12" />
      <v-col
        cols="auto"
        class="docs-form-sector"
      >
        <VeoForm
          v-model="dynamicForm.data"
          :schema="dynamicForm.objectSchema"
          :ui="dynamicForm.formSchema"
          :general-translation="dynamicForm.lang[activeLanguage]"
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
import Vue from 'vue';

export default Vue.extend({
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
                          },
                          subType: {
                            enum: ['VT']
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
      }
    };
  },
  computed: {
    dynamicForm(): any {
      return this.form;
    }
  }
});
</script>

<style lang="scss"></style>
